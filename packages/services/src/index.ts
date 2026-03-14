import {
  buildKpis,
  createCustomerOnboarding,
  createProduct,
  getDataset,
  networkSeries,
  paginate,
  revenueSeries,
  type CustomerOnboardingInput,
  type ProductInput
} from "@telecosync/database";

export function getDashboardSnapshot() {
  const dataset = getDataset();
  return {
    kpis: buildKpis(),
    revenueSeries: revenueSeries(),
    networkSeries: networkSeries(),
    recentOrders: dataset.orders.slice(0, 8),
    activeAlarms: dataset.alarms.filter((alarm) => alarm.status !== "cleared").slice(0, 8),
    workflows: dataset.workflows,
    notifications: dataset.notifications.slice(0, 8)
  };
}

export function getCollection(name: keyof ReturnType<typeof getDataset>, page = 1, pageSize = 10, search = "") {
  const dataset = getDataset();
  const list = dataset[name] as unknown as Array<Record<string, unknown>>;
  const lowered = search.trim().toLowerCase();
  const filtered = lowered
    ? list.filter((item) => JSON.stringify(item).toLowerCase().includes(lowered))
    : list;

  return paginate(filtered, page, pageSize);
}

export function getAnalyticsSummary() {
  const dataset = getDataset();
  return {
    revenueLeakageRisk: "2.8%",
    churnRiskCustomers: dataset.customers.filter((customer) => customer.churnRisk > 30).length,
    networkCapacityHotspots: dataset.networkElements.filter((item) => item.capacityUtilization > 75).length,
    overdueInvoices: dataset.invoices.filter((invoice) => invoice.status === "overdue").length
  };
}

export function getAiSignals() {
  const dataset = getDataset();
  return [
    {
      model: "Predictive network failure detection",
      score: 0.91,
      recommendation: `Inspect ${dataset.networkElements[3].hostname} within 6 hours`
    },
    {
      model: "Customer churn prediction",
      score: 0.76,
      recommendation: `Target ${dataset.customers[11].name} with loyalty retention offer`
    },
    {
      model: "Fraud detection",
      score: 0.64,
      recommendation: `Review unusually high SMS burst on ${dataset.subscriptions[42].id}`
    },
    {
      model: "Revenue optimization",
      score: 0.83,
      recommendation: "Shift roaming discount policy to usage tiering"
    },
    {
      model: "Capacity forecasting",
      score: 0.88,
      recommendation: "Augment fiber uplink capacity in Dallas POP cluster"
    },
    {
      model: "Network anomaly detection",
      score: 0.79,
      recommendation: "Correlate packet-loss spike with transport maintenance window"
    }
  ];
}

export function getBillingWorkspace(search = "") {
  const dataset = getDataset();
  const lowered = search.trim().toLowerCase();
  const invoices = dataset.invoices
    .map((invoice) => {
      const customer = dataset.customers.find((item) => item.id === invoice.customerId);
      const contact = dataset.contacts.find((item) => item.customerId === invoice.customerId);
      const payment = dataset.payments.find((item) => item.invoiceId === invoice.id);
      const subscription = dataset.subscriptions.find((item) => item.customerId === invoice.customerId);
      const product = dataset.products.find((item) => item.id === subscription?.productId);

      return {
        ...invoice,
        customerName: customer?.name ?? "Unknown customer",
        recipientEmail: contact?.email ?? "billing@unknown.telecosync.test",
        paymentStatus: payment?.status ?? "pending",
        paymentMethod: payment?.method ?? "bank",
        emailStatus: invoice.status === "draft" ? "queued" : "sent",
        sentAt: invoice.updatedAt,
        productName: product?.name ?? "Service charge",
        subtotal: Number((invoice.total - invoice.tax).toFixed(2))
      };
    })
    .filter((invoice) => (lowered ? JSON.stringify(invoice).toLowerCase().includes(lowered) : true));

  return {
    invoices: invoices.slice(0, 24),
    summary: {
      totalInvoices: dataset.invoices.length,
      issuedInvoices: dataset.invoices.filter((item) => item.status === "issued").length,
      overdueInvoices: dataset.invoices.filter((item) => item.status === "overdue").length,
      cashCollected: dataset.payments.filter((item) => item.status === "received").reduce((sum, item) => sum + item.amount, 0)
    }
  };
}

export function getAnalyticsWorkspace() {
  return {
    summary: getAnalyticsSummary(),
    signals: getAiSignals(),
    generatedAt: new Date().toISOString(),
    executiveInsights: [
      "Revenue leakage remains concentrated in overdue enterprise invoices and delayed remediation of roaming adjustments.",
      "Churn pressure is highest in mid-market accounts with unresolved support friction and lower satisfaction trends.",
      "Capacity investment should prioritize Dallas and Seattle access clusters before seasonal demand peaks."
    ]
  };
}

export function generateAnalyticsInsights() {
  const dataset = getDataset();
  const generatedAt = new Date().toISOString();
  const highestRevenueCustomer = [...dataset.customers].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)[0];
  const highestCapacityNode = [...dataset.networkElements].sort((a, b) => b.capacityUtilization - a.capacityUtilization)[0];
  const overdueInvoice = dataset.invoices.find((item) => item.status === "overdue") ?? dataset.invoices[0];

  return {
    generatedAt,
    insights: [
      {
        title: "Retention intervention",
        detail: `Prioritize ${highestRevenueCustomer.name} for retention outreach before the next renewal cycle.`,
        confidence: 0.87
      },
      {
        title: "Capacity action",
        detail: `Expand transport headroom around ${highestCapacityNode.hostname} to reduce congestion risk.`,
        confidence: 0.91
      },
      {
        title: "Collections action",
        detail: `Escalate invoice ${overdueInvoice.id} through billing assurance workflow to accelerate cash recovery.`,
        confidence: 0.83
      }
    ]
  };
}

export function getDocumentWorkspace(search = "") {
  const dataset = getDataset();
  const lowered = search.trim().toLowerCase();
  const documents = dataset.documents
    .map((document) => ({
      ...document,
      tenantName: dataset.tenants.find((item) => item.id === document.tenantId)?.name ?? "Unknown tenant",
      description: {
        contract: "Commercial service agreement and legal terms.",
        sla: "Service targets, uptime, latency, and escalation commitments.",
        technical: "Operational runbook and implementation guidance.",
        invoice: "Customer billing packet and commercial breakdown."
      }[document.documentType]
    }))
    .filter((document) => (lowered ? JSON.stringify(document).toLowerCase().includes(lowered) : true));

  return {
    documents: documents.slice(0, 24),
    summary: {
      totalDocuments: dataset.documents.length,
      contracts: dataset.documents.filter((item) => item.documentType === "contract").length,
      slas: dataset.documents.filter((item) => item.documentType === "sla").length,
      technical: dataset.documents.filter((item) => item.documentType === "technical").length,
      invoices: dataset.documents.filter((item) => item.documentType === "invoice").length
    }
  };
}

export function getDocumentDetail(documentId: string) {
  const dataset = getDataset();
  const document = dataset.documents.find((item) => item.id === documentId);
  if (!document) {
    return null;
  }

  const tenantName = dataset.tenants.find((item) => item.id === document.tenantId)?.name ?? "Unknown tenant";
  const contentMap = {
    contract: [
      "Master Services Agreement",
      `Customer: ${tenantName}`,
      "Scope: Managed telecom connectivity, service assurance, and billing operations.",
      "Commercial terms: 36-month committed term with quarterly service reviews.",
      "Support model: 24x7 enterprise support with priority incident handling."
    ],
    sla: [
      "Service Level Agreement",
      `Customer: ${tenantName}`,
      "Availability target: 99.95%",
      "Latency target: <= 20 ms for core managed connectivity services.",
      "Credits: Applied automatically for sustained target breaches."
    ],
    technical: [
      "Technical Operations Runbook",
      `Tenant: ${tenantName}`,
      "Operational sequence: order validation, service activation, monitoring handoff, billing release.",
      "Escalation path: NOC -> Service Ops -> Field Dispatch -> Vendor Management.",
      "Rollback plan: controlled service fallback with incident correlation."
    ],
    invoice: [
      "Invoice Document",
      `Bill-to: ${tenantName}`,
      "Charges: recurring service fees, usage charges, and applicable taxes.",
      "Payment terms: net 15 days from invoice issue date.",
      "Delivery method: customer billing email and in-app document archive."
    ]
  } as const;

  return {
    ...document,
    tenantName,
    previewTitle: document.name.replace(/\.pdf$/i, ""),
    content: contentMap[document.documentType].join("\n")
  };
}

export function getAuditFeed() {
  return getDataset().eventLogs.slice(0, 20);
}

export function getCustomerWorkspace(search = "") {
  const dataset = getDataset();
  const lowered = search.trim().toLowerCase();
  const customers = lowered
    ? dataset.customers.filter((customer) => JSON.stringify(customer).toLowerCase().includes(lowered))
    : dataset.customers;

  const activeCustomers = dataset.customers.filter((customer) => customer.lifecycleStage === "active").length;
  const atRiskCustomers = dataset.customers.filter((customer) => customer.lifecycleStage === "at_risk").length;
  const totalMrr = dataset.customers.reduce((sum, customer) => sum + customer.monthlyRevenue, 0);

  return {
    customers: customers.slice(0, 24),
    recentOrders: dataset.orders.slice(0, 8),
    subscriptions: dataset.subscriptions.slice(0, 8),
    summary: {
      totalCustomers: dataset.customers.length,
      activeCustomers,
      atRiskCustomers,
      totalMrr
    }
  };
}

export function getProductWorkspace(search = "", family = "") {
  const dataset = getDataset();
  const lowered = search.trim().toLowerCase();
  const products = dataset.products
    .filter((product) => (family ? product.family === family : true))
    .filter((product) => (lowered ? JSON.stringify(product).toLowerCase().includes(lowered) : true))
    .map((product) => ({
      ...product,
      plan: dataset.productPlans.find((plan) => plan.productId === product.id),
      pricingRule: dataset.pricingRules.find((rule) => rule.productId === product.id),
      promotion: dataset.promotions.find((promotion) => promotion.productId === product.id && promotion.active)
    }));

  return {
    products: products.slice(0, 24),
    bundles: dataset.bundles.slice(0, 6).map((bundle) => ({
      ...bundle,
      products: bundle.productIds.map((id) => dataset.products.find((product) => product.id === id)?.name).filter(Boolean)
    })),
    summary: {
      totalProducts: dataset.products.length,
      activePromotions: dataset.promotions.filter((promotion) => promotion.active).length,
      avgPrice: Math.round(dataset.products.reduce((sum, product) => sum + product.basePrice, 0) / dataset.products.length),
      catalogVersions: new Set(dataset.products.map((product) => product.version)).size
    }
  };
}

export function onboardCustomer(input: CustomerOnboardingInput) {
  return createCustomerOnboarding(input);
}

export function createCatalogProduct(input: ProductInput) {
  return createProduct(input);
}
