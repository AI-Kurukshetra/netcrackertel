import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrCreateBillingCycle, getOrCreateService, getOrCreateTenant } from "@/lib/supabase-helpers";

function mapCustomer(row: any) {
  return {
    id: row.id,
    name: row.name,
    segment: row.segment,
    lifecycleStage: row.lifecycle_stage,
    monthlyRevenue: Number(row.monthly_revenue ?? 0),
    supportTier: row.support_tier ?? "standard",
    city: row.city ?? ""
  };
}

export async function getCustomerWorkspaceSupabase(client: SupabaseClient, search = "") {
  const tenant = await getOrCreateTenant(client);
  const base = client.from("customers").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false });
  const customerQuery = search ? base.or(`name.ilike.%${search}%,city.ilike.%${search}%`) : base;
  const { data: customersRaw } = await customerQuery.limit(24);
  const customers = (customersRaw ?? []).map(mapCustomer);

  const { data: recentOrders } = await client
    .from("orders")
    .select("id,status,total,channel")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: subscriptions } = await client
    .from("subscriptions")
    .select("id,status,monthly_charge,usage_gb")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const { count: totalCustomers } = await client
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenant.id);

  const { count: activeCustomers } = await client
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenant.id)
    .eq("lifecycle_stage", "active");

  const { count: atRiskCustomers } = await client
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenant.id)
    .eq("lifecycle_stage", "at_risk");

  const { data: revenueRows } = await client
    .from("customers")
    .select("monthly_revenue")
    .eq("tenant_id", tenant.id);

  const totalMrr = (revenueRows ?? []).reduce((sum, row) => sum + Number(row.monthly_revenue ?? 0), 0);

  return {
    customers,
    recentOrders: (recentOrders ?? []).map((row) => ({
      id: row.id,
      status: row.status,
      total: Number(row.total ?? 0),
      channel: row.channel
    })),
    subscriptions: (subscriptions ?? []).map((row) => ({
      id: row.id,
      status: row.status,
      monthlyCharge: Number(row.monthly_charge ?? 0),
      usageGb: Number(row.usage_gb ?? 0)
    })),
    summary: {
      totalCustomers: totalCustomers ?? 0,
      activeCustomers: activeCustomers ?? 0,
      atRiskCustomers: atRiskCustomers ?? 0,
      totalMrr
    }
  };
}

export async function createCustomerOnboardingSupabase(client: SupabaseClient, payload: any) {
  const tenant = await getOrCreateTenant(client);
  const { data: product } = await client.from("products").select("*").eq("id", payload.productId).single();
  const service = await getOrCreateService(client, tenant.id);
  const cycle = await getOrCreateBillingCycle(client, tenant.id);

  const { data: customer } = await client
    .from("customers")
    .insert({
      tenant_id: tenant.id,
      name: payload.name,
      segment: payload.segment,
      lifecycle_stage: "active",
      monthly_revenue: product?.base_price ?? 0,
      churn_risk: 12,
      support_tier: payload.supportTier,
      city: payload.city
    })
    .select("*")
    .single();

  const { data: account } = await client
    .from("accounts")
    .insert({
      tenant_id: tenant.id,
      customer_id: customer.id,
      status: "active",
      balance: 0,
      credit_class: payload.segment === "consumer" ? "silver" : "gold"
    })
    .select("*")
    .single();

  const { data: contact } = await client
    .from("contacts")
    .insert({
      tenant_id: tenant.id,
      customer_id: customer.id,
      email: payload.email,
      phone: payload.phone,
      role: payload.segment === "consumer" ? "Primary Contact" : "Operations Manager"
    })
    .select("*")
    .single();

  const { data: subscription } = await client
    .from("subscriptions")
    .insert({
      tenant_id: tenant.id,
      customer_id: customer.id,
      service_id: service.id,
      product_id: product?.id,
      status: "active",
      monthly_charge: product?.base_price ?? 0,
      usage_gb: 0
    })
    .select("*")
    .single();

  const { data: serviceInstance } = await client
    .from("service_instances")
    .insert({
      tenant_id: tenant.id,
      service_id: service.id,
      subscription_id: subscription.id,
      status: "active",
      uptime: 100
    })
    .select("*")
    .single();

  const { data: order } = await client
    .from("orders")
    .insert({
      tenant_id: tenant.id,
      customer_id: customer.id,
      status: "completed",
      total: product?.base_price ?? 0,
      channel: "portal"
    })
    .select("*")
    .single();

  const { data: invoice } = await client
    .from("invoices")
    .insert({
      tenant_id: tenant.id,
      customer_id: customer.id,
      cycle_id: cycle.id,
      total: Number(((product?.base_price ?? 0) * 1.18).toFixed(2)),
      tax: Number(((product?.base_price ?? 0) * 0.18).toFixed(2)),
      status: "issued",
      due_date: new Date(Date.now() + 15 * 86400000).toISOString()
    })
    .select("*")
    .single();

  const { data: payment } = await client
    .from("payments")
    .insert({
      tenant_id: tenant.id,
      invoice_id: invoice.id,
      amount: invoice.total,
      method: "bank",
      status: "pending"
    })
    .select("*")
    .single();

  await client.from("notifications").insert({
    tenant_id: tenant.id,
    channel: "email",
    title: `Invoice ${invoice.id} sent to ${contact.email}`,
    category: "billing",
    read: false
  });

  return {
    customer: mapCustomer(customer),
    account,
    contact,
    subscription: {
      id: subscription.id,
      status: subscription.status,
      monthlyCharge: Number(subscription.monthly_charge ?? 0),
      usageGb: Number(subscription.usage_gb ?? 0)
    },
    serviceInstance,
    order,
    invoice: {
      id: invoice.id,
      status: invoice.status,
      total: Number(invoice.total ?? 0)
    },
    payment
  };
}

export async function getProductWorkspaceSupabase(client: SupabaseClient, search = "", family = "") {
  const tenant = await getOrCreateTenant(client);
  let query = client.from("products").select("*").eq("tenant_id", tenant.id);
  if (family) query = query.eq("family", family);
  if (search) query = query.ilike("name", `%${search}%`);
  const { data: products } = await query.order("created_at", { ascending: false }).limit(24);

  const productIds = (products ?? []).map((p) => p.id);
  const { data: plans } = await client.from("product_plans").select("*").in("product_id", productIds);
  const { data: pricing } = await client.from("pricing_rules").select("*").in("product_id", productIds);
  const { data: promotions } = await client.from("promotions").select("*").in("product_id", productIds).eq("active", true);

  const { data: bundles } = await client
    .from("bundles")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(6);

  return {
    products: (products ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      family: product.family,
      version: product.version,
      basePrice: Number(product.base_price ?? 0),
      slaTarget: Number(product.sla_target ?? 0),
      plan: plans?.find((plan) => plan.product_id === product.id)
        ? {
            downloadMbps: plans?.find((plan) => plan.product_id === product.id)?.download_mbps ?? 0,
            uploadMbps: plans?.find((plan) => plan.product_id === product.id)?.upload_mbps ?? 0,
            dataLimitGb: plans?.find((plan) => plan.product_id === product.id)?.data_limit_gb ?? 0
          }
        : undefined,
      pricingRule: pricing?.find((rule) => rule.product_id === product.id)
        ? {
            expression: pricing?.find((rule) => rule.product_id === product.id)?.expression ?? ""
          }
        : undefined,
      promotion: promotions?.find((promo) => promo.product_id === product.id)
        ? {
            name: promotions?.find((promo) => promo.product_id === product.id)?.name ?? "",
            discountPercent: Number(promotions?.find((promo) => promo.product_id === product.id)?.discount_percent ?? 0)
          }
        : undefined
    })),
    bundles: (bundles ?? []).map((bundle) => ({
      id: bundle.id,
      name: bundle.name,
      price: Number(bundle.price ?? 0),
      products: []
    })),
    summary: {
      totalProducts: products?.length ?? 0,
      activePromotions: promotions?.length ?? 0,
      avgPrice: Math.round(
        (products ?? []).reduce((sum, product) => sum + Number(product.base_price ?? 0), 0) /
          Math.max(1, products?.length ?? 1)
      ),
      catalogVersions: new Set((products ?? []).map((product) => product.version)).size
    }
  };
}

export async function createProductSupabase(client: SupabaseClient, payload: any) {
  const tenant = await getOrCreateTenant(client);
  const { data: product } = await client
    .from("products")
    .insert({
      tenant_id: tenant.id,
      name: payload.name,
      family: payload.family,
      version: payload.version,
      base_price: payload.basePrice,
      sla_target: payload.slaTarget
    })
    .select("*")
    .single();

  await client.from("product_plans").insert({
    tenant_id: tenant.id,
    product_id: product.id,
    name: `${product.name} plan`,
    download_mbps: payload.downloadMbps,
    upload_mbps: payload.uploadMbps,
    data_limit_gb: payload.dataLimitGb
  });

  await client.from("pricing_rules").insert({
    tenant_id: tenant.id,
    product_id: product.id,
    rule_type: "base",
    expression: `base_price(${Number(payload.basePrice).toFixed(2)})`
  });

  return {
    product,
    plan: {
      downloadMbps: payload.downloadMbps,
      uploadMbps: payload.uploadMbps,
      dataLimitGb: payload.dataLimitGb
    },
    pricingRule: { expression: `base_price(${Number(payload.basePrice).toFixed(2)})` }
  };
}

export async function getBillingWorkspaceSupabase(client: SupabaseClient, search = "") {
  const tenant = await getOrCreateTenant(client);
  const base = client.from("invoices").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false });
  const invoiceQuery = search ? base.or(`id.ilike.%${search}%`) : base;
  const { data: invoices } = await invoiceQuery.limit(24);
  const customerIds = (invoices ?? []).map((inv) => inv.customer_id);
  const { data: customers } = await client.from("customers").select("id,name").in("id", customerIds);
  const { data: contacts } = await client.from("contacts").select("customer_id,email").in("customer_id", customerIds);
  const { data: payments } = await client.from("payments").select("invoice_id,status,method").in("invoice_id", (invoices ?? []).map((inv) => inv.id));
  const { data: subscriptions } = await client.from("subscriptions").select("customer_id,product_id").in("customer_id", customerIds);
  const { data: products } = await client.from("products").select("id,name").in("id", (subscriptions ?? []).map((sub) => sub.product_id));

  const invoiceList = (invoices ?? []).map((invoice) => {
    const customer = customers?.find((item) => item.id === invoice.customer_id);
    const contact = contacts?.find((item) => item.customer_id === invoice.customer_id);
    const payment = payments?.find((item) => item.invoice_id === invoice.id);
    const subscription = subscriptions?.find((item) => item.customer_id === invoice.customer_id);
    const product = products?.find((item) => item.id === subscription?.product_id);
    return {
      id: invoice.id,
      customerId: invoice.customer_id,
      customerName: customer?.name ?? "Unknown customer",
      recipientEmail: contact?.email ?? "billing@unknown.telecosync.test",
      total: Number(invoice.total ?? 0),
      tax: Number(invoice.tax ?? 0),
      subtotal: Number((Number(invoice.total ?? 0) - Number(invoice.tax ?? 0)).toFixed(2)),
      status: invoice.status,
      dueDate: invoice.due_date,
      paymentStatus: payment?.status ?? "pending",
      paymentMethod: payment?.method ?? "bank",
      emailStatus: invoice.status === "draft" ? "queued" : "sent",
      sentAt: invoice.updated_at,
      productName: product?.name ?? "Service charge"
    };
  });

  const { count: totalInvoices } = await client
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenant.id);
  const { count: issuedInvoices } = await client
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenant.id)
    .eq("status", "issued");
  const { count: overdueInvoices } = await client
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenant.id)
    .eq("status", "overdue");
  const { data: paymentsSum } = await client
    .from("payments")
    .select("amount")
    .eq("tenant_id", tenant.id)
    .eq("status", "received");

  const cashCollected = (paymentsSum ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  return {
    invoices: invoiceList,
    summary: {
      totalInvoices: totalInvoices ?? 0,
      issuedInvoices: issuedInvoices ?? 0,
      overdueInvoices: overdueInvoices ?? 0,
      cashCollected
    }
  };
}

export async function getServicesSupabase(client: SupabaseClient, search = "") {
  const tenant = await getOrCreateTenant(client);
  let query = client.from("service_instances").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false });
  if (search) query = query.or(`id.ilike.%${search}%`);
  const { data: services } = await query.limit(24);
  return {
    data: services ?? [],
    total: services?.length ?? 0
  };
}

export async function getOrdersSupabase(client: SupabaseClient, search = "") {
  const tenant = await getOrCreateTenant(client);
  let query = client.from("orders").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false });
  if (search) query = query.or(`id.ilike.%${search}%`);
  const { data: orders } = await query.limit(24);
  return {
    data: orders ?? [],
    total: orders?.length ?? 0
  };
}

export async function getWorkflowsSupabase(client: SupabaseClient) {
  const tenant = await getOrCreateTenant(client);
  const { data: workflows } = await client.from("workflows").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }).limit(24);
  return {
    data: (workflows ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      trigger: row.trigger,
      status: row.status,
      successRate: Number(row.success_rate ?? 0),
      updatedAt: row.updated_at
    })),
    total: workflows?.length ?? 0
  };
}

export async function createWorkflowSupabase(client: SupabaseClient, name: string, trigger: string) {
  const tenant = await getOrCreateTenant(client);
  const { data: workflow } = await client
    .from("workflows")
    .insert({
      tenant_id: tenant.id,
      name,
      trigger,
      status: "active",
      success_rate: 96.2
    })
    .select("*")
    .single();
  return workflow;
}

export async function toggleWorkflowSupabase(client: SupabaseClient, workflowId: string, status: string) {
  const { data: workflow } = await client.from("workflows").update({ status, updated_at: new Date().toISOString() }).eq("id", workflowId).select("*").single();
  return workflow;
}

export async function runWorkflowSupabase(client: SupabaseClient, workflowId: string) {
  const { data: workflow } = await client.from("workflows").select("*").eq("id", workflowId).single();
  if (workflow?.status !== "active") {
    throw new Error("Workflow must be active before it can be run");
  }
  const updated = await client
    .from("workflows")
    .update({ success_rate: Math.min(99.4, Number(workflow.success_rate ?? 0) + 0.2), updated_at: new Date().toISOString() })
    .eq("id", workflowId)
    .select("*")
    .single();
  await client.from("notifications").insert({
    tenant_id: workflow.tenant_id,
    channel: "in_app",
    title: `${workflow.name} workflow executed successfully`,
    category: "order",
    read: false
  });
  return updated.data;
}

export async function getDocumentsWorkspaceSupabase(client: SupabaseClient, search = "") {
  const tenant = await getOrCreateTenant(client);
  let query = client.from("documents").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false });
  if (search) query = query.or(`name.ilike.%${search}%`);
  const { data: documents } = await query.limit(24);
  const descriptions: Record<string, string> = {
    contract: "Commercial service agreement and legal terms.",
    sla: "Service targets, uptime, latency, and escalation commitments.",
    technical: "Operational runbook and implementation guidance.",
    invoice: "Customer billing packet and commercial breakdown."
  };
  return {
    documents: (documents ?? []).map((doc) => ({
      id: doc.id,
      name: doc.name,
      documentType: doc.document_type,
      bucket: doc.bucket,
      path: doc.path,
      tenantName: tenant.name,
      description: descriptions[doc.document_type] ?? "Operational document record."
    })),
    summary: {
      totalDocuments: documents?.length ?? 0,
      contracts: (documents ?? []).filter((d) => d.document_type === "contract").length,
      slas: (documents ?? []).filter((d) => d.document_type === "sla").length,
      technical: (documents ?? []).filter((d) => d.document_type === "technical").length,
      invoices: (documents ?? []).filter((d) => d.document_type === "invoice").length
    }
  };
}

export async function getDocumentDetailSupabase(client: SupabaseClient, documentId: string) {
  const { data: doc } = await client.from("documents").select("*").eq("id", documentId).single();
  if (!doc) return null;
  return {
    id: doc.id,
    name: doc.name,
    previewTitle: doc.name.replace(/\.pdf$/i, ""),
    documentType: doc.document_type,
    tenantName: "TelecoSync Primary",
    path: doc.path,
    content: [
      "Document Preview",
      `Type: ${doc.document_type}`,
      "This is a placeholder document preview generated by TelecoSync."
    ].join("\n")
  };
}

export async function getAnalyticsWorkspaceSupabase(client: SupabaseClient) {
  const tenant = await getOrCreateTenant(client);
  const { count: churnRiskCustomers } = await client
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenant.id)
    .gt("churn_risk", 30);
  const { count: overdueInvoices } = await client
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenant.id)
    .eq("status", "overdue");
  const { count: capacityHotspots } = await client
    .from("network_elements")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenant.id)
    .gt("capacity_utilization", 75);

  return {
    summary: {
      revenueLeakageRisk: "2.8%",
      churnRiskCustomers: churnRiskCustomers ?? 0,
      networkCapacityHotspots: capacityHotspots ?? 0,
      overdueInvoices: overdueInvoices ?? 0
    },
    signals: [
      {
        model: "Predictive network failure detection",
        score: 0.91,
        recommendation: "Inspect top access aggregation clusters within 6 hours"
      },
      {
        model: "Customer churn prediction",
        score: 0.76,
        recommendation: "Target at-risk enterprise accounts with retention offers"
      },
      {
        model: "Fraud detection",
        score: 0.64,
        recommendation: "Review anomalous messaging bursts in prepaid segments"
      },
      {
        model: "Revenue optimization",
        score: 0.83,
        recommendation: "Adjust roaming discount tiers to improve margin"
      }
    ],
    generatedAt: new Date().toISOString(),
    executiveInsights: [
      "Revenue leakage remains concentrated in overdue enterprise invoices.",
      "Churn pressure is highest in mid-market accounts with lower satisfaction.",
      "Capacity investment should prioritize metro access clusters before seasonal demand peaks."
    ]
  };
}

export async function getDashboardSnapshotSupabase(client: SupabaseClient) {
  const tenant = await getOrCreateTenant(client);
  const { data: invoices } = await client.from("invoices").select("total").eq("tenant_id", tenant.id);
  const { data: payments } = await client.from("payments").select("amount,status").eq("tenant_id", tenant.id);
  const { count: criticalAlarms } = await client
    .from("alarms")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenant.id)
    .eq("severity", "critical")
    .neq("status", "cleared");
  const { count: openOrders } = await client
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenant.id)
    .neq("status", "completed");

  const revenue = (invoices ?? []).reduce((sum, row) => sum + Number(row.total ?? 0), 0);
  const paid = (payments ?? []).filter((p) => p.status === "received").reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  return {
    kpis: [
      { label: "Recognized revenue", value: `$${Math.round(revenue / 1000)}K`, delta: "+8.2%" },
      { label: "Cash collected", value: `$${Math.round(paid / 1000)}K`, delta: "+5.1%" },
      { label: "Open orchestration", value: String(openOrders ?? 0), delta: "-4.3%" },
      { label: "Critical alarms", value: String(criticalAlarms ?? 0), delta: "-12.0%" }
    ],
    revenueSeries: [],
    networkSeries: [],
    recentOrders: [],
    activeAlarms: [],
    workflows: [],
    notifications: []
  };
}
