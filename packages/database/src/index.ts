import type {
  Account,
  Alarm,
  AnalyticsKpi,
  Asset,
  BillingCycle,
  Bundle,
  Contact,
  Contract,
  Customer,
  DemoUser,
  DocumentRecord,
  EventLog,
  FulfillmentTask,
  Incident,
  Invoice,
  Location,
  NetworkElement,
  NetworkInterface,
  Notification,
  Order,
  OrderItem,
  Payment,
  PerformanceMetric,
  Permission,
  PlatformDataset,
  PricingRule,
  Product,
  ProductPlan,
  Promotion,
  ProvisioningTask,
  RatingRule,
  Role,
  SafeUser,
  Service,
  ServiceInstance,
  SLA,
  Subscription,
  TelecomCompany,
  TimeSeriesPoint,
  TroubleTicket,
  UsageRecord,
  Vendor,
  WorkOrder,
  Workflow
} from "@telecosync/types";

const now = new Date("2026-03-14T10:00:00.000Z");

function iso(offsetDays = 0, offsetHours = 0) {
  return new Date(now.getTime() + offsetDays * 86400000 + offsetHours * 3600000).toISOString();
}

function makeId(prefix: string, index: number) {
  return `${prefix}_${String(index + 1).padStart(4, "0")}`;
}

function amount(base: number, step: number, index: number) {
  return Number((base + (index % step) * 7.25).toFixed(2));
}

const tenantNames = [
  "Aster Mobile",
  "Nimbus MVNO",
  "Orion Fiber",
  "Helix Telecom",
  "NorthGrid ISP",
  "Pulse Wireless",
  "Summit Broadband",
  "Vertex Connect",
  "Quanta IoT",
  "Nova Private 5G"
];

const cities = ["New York", "Dallas", "Chicago", "San Jose", "Seattle", "Miami", "Denver", "Atlanta", "Boston", "Phoenix"];
const countries = ["USA", "USA", "USA", "USA", "USA", "USA", "USA", "USA", "USA", "USA"];
const productFamilies = ["mobile", "broadband", "iot", "private_5g", "voice"] as const;
const segments = ["consumer", "business", "government", "iot"] as const;
const ticketPriorities = ["low", "medium", "high", "critical"] as const;
const orderStatuses = ["captured", "validated", "provisioning", "completed", "blocked"] as const;
const alarmSeverities = ["info", "warning", "major", "critical"] as const;
const firstNames = ["Ava", "Liam", "Mia", "Noah", "Isla", "Ethan", "Priya", "Lucas", "Nina", "Arjun", "Grace", "Mateo", "Emma", "Elijah", "Sofia", "Kai", "Zoe", "Aiden", "Leah", "Rohan"];
const lastNames = ["Johnson", "Patel", "Martinez", "Kim", "Thompson", "Garcia", "Singh", "Brooks", "Miller", "Rivera", "Hughes", "Bennett", "Carter", "Lewis", "Flores", "Ward", "Bailey", "Long", "Shaw", "Myers"];
const enterprisePrefixes = ["Atlas", "BluePeak", "Crest", "Delta", "Everstream", "Frontier", "Granite", "Harbor", "Ironclad", "Juniper", "Keystone", "Lighthouse"];
const enterpriseIndustries = ["Logistics", "Health", "Retail", "Energy", "Financial", "Aviation", "Media", "Manufacturing", "Hospitality", "Mobility"];
const publicAgencies = ["Transit Authority", "Port Authority", "Public Schools", "Emergency Services", "County Health", "Utilities Board", "Municipal Broadband", "State University"];
const iotPrograms = ["Smart Metering", "Fleet Tracking", "Cold Chain", "Utility Sensors", "Connected Mobility", "Asset Telemetry", "Industrial Monitoring", "Campus Access"];
const vendorNames = ["Ericsson", "Nokia", "Cisco", "Juniper", "Ciena", "Amdocs", "Netcracker", "Mavenir", "Ribbon", "Fortinet", "Palo Alto Networks", "Radisys", "Dell", "HPE", "NEC", "ZTE", "Casa Systems", "CommScope", "Ceragon", "Red Hat"];
const locationNames = ["Newark Core POP", "Dallas Edge Hub", "Chicago Metro Core", "San Jose Cloud Edge", "Seattle Transit POP", "Miami Gateway", "Denver Fiber Hub", "Atlanta Service Hub", "Boston Harbor POP", "Phoenix Core Site", "Austin 5G Lab", "Charlotte Access Hub", "Portland Regional POP", "Las Vegas Event Edge", "Philadelphia Transit Core", "Nashville Fiber POP", "Salt Lake Backbone Hub", "San Diego Mobility Edge", "Minneapolis NOC", "Tampa Carrier Hotel"];
const mobilePlanNames = ["5G Unlimited Max", "5G Business Flex", "Family Share 120", "Traveler Elite", "Campus Connect", "Rural Reach", "Enterprise eSIM Fleet", "RoamFree Global", "Priority Unlimited", "FirstNet Response"];
const broadbandPlanNames = ["Fiber 500", "Fiber 1 Gig Pro", "Metro Ethernet 2G", "SMB Business Broadband", "Dedicated Internet 10G", "Residential Fiber Plus", "Wholesale Backhaul", "Branch SD-WAN Access", "Campus Fiber Ring", "Business Continuity Link"];
const iotPlanNames = ["IoT Sensor Connect", "FleetSIM Control", "Utility Grid LPWAN", "Cold Chain Monitor", "Smart City Devices", "Industrial Edge Telemetry", "Asset Tracker Core", "Connected Camera Data", "NB-IoT Metering", "Massive IoT Connect"];
const private5gPlanNames = ["Private 5G Campus", "Industrial 5G Secure", "Port Automation 5G", "Warehouse Robotics 5G", "Smart Mine Network", "Stadium Private 5G", "Hospital Private Mobility", "Defense Site 5G", "Energy Field 5G", "Manufacturing Slice"];
const voicePlanNames = ["Cloud PBX Core", "Contact Center Voice", "SIP Trunk Enterprise", "Operator Connect Voice", "Secure Voice Plus", "UC Voice Flex", "Branch Voice Bundle", "Call Center Premium", "Hosted Voice Standard", "Voice Continuity Suite"];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function familyIndex(index: number) {
  return Math.floor(index / productFamilies.length);
}

function customerDisplayName(index: number, segment: typeof segments[number]) {
  if (segment === "consumer") {
    return `${firstNames[index % firstNames.length]} ${lastNames[(index * 3) % lastNames.length]}`;
  }

  if (segment === "business") {
    return `${enterprisePrefixes[index % enterprisePrefixes.length]} ${enterpriseIndustries[index % enterpriseIndustries.length]} ${["Group", "Networks", "Holdings", "Services", "Partners"][index % 5]}`;
  }

  if (segment === "government") {
    return `${cities[index % cities.length]} ${publicAgencies[index % publicAgencies.length]}`;
  }

  return `${enterprisePrefixes[(index + 4) % enterprisePrefixes.length]} ${iotPrograms[index % iotPrograms.length]}`;
}

function contactEmail(name: string, index: number, segment: typeof segments[number]) {
  const slug = slugify(name);
  if (segment === "consumer") {
    return `${slug.replace(/-/g, ".")}@mail.telecosync.test`;
  }
  if (segment === "government") {
    return `admin@${slug}.gov.telecosync.test`;
  }
  if (segment === "iot") {
    return `noc@${slug}.iot.telecosync.test`;
  }
  return `ops@${slug}.corp.telecosync.test`;
}

function productName(family: typeof productFamilies[number], index: number) {
  const byFamily = {
    mobile: mobilePlanNames,
    broadband: broadbandPlanNames,
    iot: iotPlanNames,
    private_5g: private5gPlanNames,
    voice: voicePlanNames
  } as const;

  return byFamily[family][index];
}

function productBasePrice(family: typeof productFamilies[number], index: number) {
  const base = {
    mobile: 39,
    broadband: 119,
    iot: 9,
    private_5g: 950,
    voice: 24
  } as const;

  return Number((base[family] + index * (family === "private_5g" ? 180 : family === "broadband" ? 30 : 8)).toFixed(2));
}

function onboardingSummary(productNameValue: string, customerNameValue: string) {
  return `Onboarded ${customerNameValue} onto ${productNameValue}`;
}

export function generateDataset(): PlatformDataset {
  const tenants: TelecomCompany[] = tenantNames.map((name, index) => ({
    id: makeId("tenant", index),
    tenantId: makeId("tenant", index),
    createdAt: iso(-60 + index),
    updatedAt: iso(-1),
    deletedAt: null,
    name,
    code: name.toUpperCase().replace(/[^A-Z0-9]+/g, "_"),
    region: ["North America", "EMEA", "North America", "APAC"][index % 4],
    tier: (["enterprise", "growth", "mvno"] as const)[index % 3],
    arr: 2000000 + index * 450000,
    subscribers: 42000 + index * 12500,
    activeServices: 8500 + index * 900
  }));

  const roles: Role[] = [
    { id: "role_admin", name: "Admin", description: "Platform-wide administration" },
    { id: "role_network_engineer", name: "Network Engineer", description: "Network operations and performance" },
    { id: "role_support_agent", name: "Support Agent", description: "Customer support workflows" },
    { id: "role_billing_manager", name: "Billing Manager", description: "Billing and revenue oversight" },
    { id: "role_product_manager", name: "Product Manager", description: "Catalog and commercial strategy" },
    { id: "role_field_technician", name: "Field Technician", description: "Work orders and provisioning" }
  ];

  const permissions: Permission[] = [
    ["customers", "read"], ["customers", "write"], ["products", "write"], ["orders", "write"], ["billing", "approve"],
    ["inventory", "read"], ["network", "manage"], ["faults", "manage"], ["analytics", "read"], ["admin", "manage"]
  ].map(([resource, action], index) => ({ id: makeId("perm", index), resource, action }));

  const users: DemoUser[] = [
    ["admin@telecosync.com", "Admin", "Platform Administrator", "Admin"],
    ["network@telecosync.com", "Network Engineer", "Network Operations", "Network Engineer"],
    ["support@telecosync.com", "Support Agent", "Customer Care", "Support Agent"],
    ["billing@telecosync.com", "Billing Manager", "Revenue Operations", "Billing Manager"],
    ["product@telecosync.com", "Product Manager", "Commercial Strategy", "Product Manager"],
    ["field@telecosync.com", "Field Technician", "Field Services", "Field Technician"]
  ].map(([email, role, title, name], index) => ({
    id: makeId("user", index),
    tenantId: tenants[0].id,
    email,
    password: "admin123",
    name,
    role,
    title
  }));

  const products: Product[] = Array.from({ length: 50 }, (_, index) => {
    const family = productFamilies[index % productFamilies.length];
    const familySlot = familyIndex(index);
    return {
      id: makeId("product", index),
      tenantId: tenants[index % tenants.length].id,
      createdAt: iso(-45 + index),
      updatedAt: iso(-1),
      deletedAt: null,
      name: productName(family, familySlot),
      family,
      version: `v${2 + (familySlot % 3)}.${(index % 5) + 1}`,
      basePrice: productBasePrice(family, familySlot),
      slaTarget: 99.7 + (index % 4) * 0.05
    };
  });

  const productPlans: ProductPlan[] = products.map((product, index) => ({
    id: makeId("plan", index),
    tenantId: product.tenantId,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    deletedAt: null,
    productId: product.id,
    name: `${product.name} plan`,
    downloadMbps: product.family === "broadband" ? 500 + familyIndex(index) * 500 : product.family === "private_5g" ? 1000 + familyIndex(index) * 250 : product.family === "mobile" ? 100 + familyIndex(index) * 40 : product.family === "voice" ? 50 : 25 + familyIndex(index) * 25,
    uploadMbps: product.family === "broadband" ? 250 + familyIndex(index) * 150 : product.family === "private_5g" ? 500 + familyIndex(index) * 100 : product.family === "mobile" ? 25 + familyIndex(index) * 10 : product.family === "voice" ? 25 : 10 + familyIndex(index) * 5,
    dataLimitGb: product.family === "iot" ? 5 + familyIndex(index) * 3 : product.family === "private_5g" ? 5000 : 200 + familyIndex(index) * 100
  }));

  const pricingRules: PricingRule[] = Array.from({ length: 50 }, (_, index) => ({
    id: makeId("pricing", index),
    tenantId: products[index].tenantId,
    createdAt: iso(-30 + index),
    updatedAt: iso(-1),
    deletedAt: null,
    productId: products[index].id,
    ruleType: (["base", "usage", "discount", "roaming"] as const)[index % 4],
    expression: `rate(${(0.02 + index * 0.001).toFixed(3)})`
  }));

  const promotions: Promotion[] = Array.from({ length: 20 }, (_, index) => ({
    id: makeId("promo", index),
    tenantId: tenants[index % tenants.length].id,
    createdAt: iso(-20 + index),
    updatedAt: iso(-1),
    deletedAt: null,
    name: ["Switch & Save", "Bundle Booster", "Launch Offer", "Enterprise Expansion", "Multi-site Discount"][index % 5] + ` ${Math.floor(index / 5) + 1}`,
    productId: products[index].id,
    discountPercent: 5 + (index % 6) * 5,
    active: index % 3 !== 0
  }));

  const bundles: Bundle[] = Array.from({ length: 10 }, (_, index) => ({
    id: makeId("bundle", index),
    tenantId: tenants[index % tenants.length].id,
    createdAt: iso(-25 + index),
    updatedAt: iso(-1),
    deletedAt: null,
    name: ["Branch-in-a-Box", "Mobile + Fiber Duo", "Field Ops Pack", "Retail Connect Suite", "Enterprise Converged Stack"][index % 5] + ` ${Math.floor(index / 5) + 1}`,
    productIds: [products[index].id, products[index + 10].id, products[index + 20].id],
    price: amount(89, 5, index)
  }));

  const services: Service[] = Array.from({ length: 20 }, (_, index) => ({
    id: makeId("service", index),
    tenantId: tenants[index % tenants.length].id,
    createdAt: iso(-50 + index),
    updatedAt: iso(-1),
    deletedAt: null,
    name: `Service Domain ${index + 1}`,
    category: (["connectivity", "managed", "voice", "security"] as const)[index % 4],
    status: (["active", "planned", "degraded"] as const)[index % 3]
  }));

  const customers: Customer[] = Array.from({ length: 500 }, (_, index) => {
    const segment = segments[index % segments.length];
    return {
      id: makeId("customer", index),
      tenantId: tenants[index % tenants.length].id,
      createdAt: iso(-90 + (index % 90)),
      updatedAt: iso(-(index % 10)),
      deletedAt: null,
      accountId: makeId("account", index),
      name: customerDisplayName(index, segment),
      segment,
      lifecycleStage: (["lead", "active", "at_risk", "inactive"] as const)[index % 4],
      monthlyRevenue: segment === "consumer" ? amount(55, 11, index) : segment === "business" ? amount(240, 15, index) : segment === "government" ? amount(420, 12, index) : amount(110, 8, index),
      churnRisk: 4 + (index % 36),
      satisfaction: 64 + (index % 32),
      supportTier: (["standard", "priority", "platinum"] as const)[index % 3],
      city: cities[index % cities.length]
    };
  });

  const accounts: Account[] = customers.map((customer, index) => ({
    id: makeId("account", index),
    tenantId: customer.tenantId,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    deletedAt: null,
    customerId: customer.id,
    status: (["active", "pending", "suspended"] as const)[index % 3],
    balance: amount(0, 14, index),
    creditClass: (["bronze", "silver", "gold", "platinum"] as const)[index % 4]
  }));

  const contacts: Contact[] = customers.map((customer, index) => ({
    id: makeId("contact", index),
    tenantId: customer.tenantId,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    deletedAt: null,
    customerId: customer.id,
    email: contactEmail(customer.name, index, customer.segment),
    phone: `+1-555-${String(1000 + index).padStart(4, "0")}`,
    role: customer.segment === "consumer" ? "Primary Contact" : ["Owner", "Network Lead", "Finance Director", "Operations Manager"][index % 4]
  }));

  const subscriptions: Subscription[] = Array.from({ length: 1000 }, (_, index) => ({
    id: makeId("subscription", index),
    tenantId: tenants[index % tenants.length].id,
    createdAt: iso(-70 + (index % 30)),
    updatedAt: iso(-(index % 8)),
    deletedAt: null,
    customerId: customers[index % customers.length].id,
    serviceId: services[index % services.length].id,
    productId: products[index % products.length].id,
    status: (["active", "pending", "paused"] as const)[index % 3],
    monthlyCharge: amount(35, 15, index),
    usageGb: 60 + (index % 180)
  }));

  const serviceInstances: ServiceInstance[] = subscriptions.map((subscription, index) => ({
    id: makeId("svcinst", index),
    tenantId: subscription.tenantId,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
    deletedAt: null,
    serviceId: subscription.serviceId,
    subscriptionId: subscription.id,
    status: (["active", "provisioning", "suspended"] as const)[index % 3],
    uptime: 98.5 + (index % 12) * 0.1
  }));

  const orders: Order[] = Array.from({ length: 2000 }, (_, index) => ({
    id: makeId("order", index),
    tenantId: tenants[index % tenants.length].id,
    createdAt: iso(-30 + (index % 30), index % 24),
    updatedAt: iso(-(index % 5)),
    deletedAt: null,
    customerId: customers[index % customers.length].id,
    status: orderStatuses[index % orderStatuses.length],
    total: amount(59, 25, index),
    channel: (["portal", "sales", "partner", "api"] as const)[index % 4]
  }));

  const orderItems: OrderItem[] = Array.from({ length: 2000 }, (_, index) => ({
    id: makeId("orderitem", index),
    tenantId: orders[index].tenantId,
    createdAt: orders[index].createdAt,
    updatedAt: orders[index].updatedAt,
    deletedAt: null,
    orderId: orders[index].id,
    productId: products[index % products.length].id,
    quantity: 1 + (index % 4),
    fulfillmentState: (["queued", "running", "done", "failed"] as const)[index % 4]
  }));

  const fulfillmentTasks: FulfillmentTask[] = Array.from({ length: 1500 }, (_, index) => ({
    id: makeId("ftask", index),
    tenantId: orders[index % orders.length].tenantId,
    createdAt: orders[index % orders.length].createdAt,
    updatedAt: iso(-(index % 4)),
    deletedAt: null,
    orderId: orders[index % orders.length].id,
    name: ["Validate KYC", "Reserve Number", "Activate SIM", "Provision VLAN"][index % 4],
    owner: ["orchestration", "fulfillment", "network", "field"][index % 4],
    status: (["queued", "running", "done", "blocked"] as const)[index % 4]
  }));

  const usageRecords: UsageRecord[] = Array.from({ length: 20000 }, (_, index) => ({
    id: makeId("usage", index),
    tenantId: subscriptions[index % subscriptions.length].tenantId,
    createdAt: iso(-15 + (index % 15), index % 24),
    updatedAt: iso(-1),
    deletedAt: null,
    subscriptionId: subscriptions[index % subscriptions.length].id,
    metric: (["data", "voice", "sms", "iot_message"] as const)[index % 4],
    quantity: Number((1 + (index % 200) * 0.8).toFixed(2)),
    cost: Number((0.05 + (index % 15) * 0.03).toFixed(2)),
    occurredAt: iso(-15 + (index % 15), index % 24)
  }));

  const ratingRules: RatingRule[] = ([
    ["data", 0.02],
    ["voice", 0.01],
    ["sms", 0.005],
    ["iot_message", 0.001]
  ] as const).map(([metric, unitPrice], index) => ({
    id: makeId("rating", index),
    tenantId: tenants[0].id,
    createdAt: iso(-90),
    updatedAt: iso(-1),
    deletedAt: null,
    metric,
    unitPrice,
    currency: "USD"
  }));

  const billingCycles: BillingCycle[] = Array.from({ length: 12 }, (_, index) => ({
    id: makeId("cycle", index),
    tenantId: tenants[index % tenants.length].id,
    createdAt: iso(-365 + index * 30),
    updatedAt: iso(-1),
    deletedAt: null,
    name: `2025-${String(index + 1).padStart(2, "0")}`,
    periodStart: iso(-365 + index * 30),
    periodEnd: iso(-335 + index * 30),
    status: index === 11 ? "open" : index > 8 ? "rating" : "closed"
  }));

  const invoices: Invoice[] = Array.from({ length: 2000 }, (_, index) => ({
    id: makeId("invoice", index),
    tenantId: customers[index % customers.length].tenantId,
    createdAt: iso(-28 + (index % 28)),
    updatedAt: iso(-(index % 3)),
    deletedAt: null,
    customerId: customers[index % customers.length].id,
    cycleId: billingCycles[index % billingCycles.length].id,
    total: amount(75, 17, index),
    tax: Number((4 + (index % 5) * 1.2).toFixed(2)),
    status: (["draft", "issued", "paid", "overdue"] as const)[index % 4],
    dueDate: iso(10 - (index % 15))
  }));

  const payments: Payment[] = invoices.slice(0, 1400).map((invoice, index) => ({
    id: makeId("payment", index),
    tenantId: invoice.tenantId,
    createdAt: iso(-20 + (index % 20)),
    updatedAt: iso(-1),
    deletedAt: null,
    invoiceId: invoice.id,
    amount: invoice.total,
    method: (["card", "bank", "wallet", "direct_debit"] as const)[index % 4],
    status: (["received", "pending", "failed"] as const)[index % 3]
  }));

  const vendors: Vendor[] = Array.from({ length: 20 }, (_, index) => ({
    id: makeId("vendor", index),
    tenantId: tenants[index % tenants.length].id,
    createdAt: iso(-100 + index),
    updatedAt: iso(-1),
    deletedAt: null,
    name: vendorNames[index],
    category: (["core", "radio", "transport", "cloud"] as const)[index % 4],
    score: 72 + (index % 20)
  }));

  const locations: Location[] = Array.from({ length: 20 }, (_, index) => ({
    id: makeId("location", index),
    tenantId: tenants[index % tenants.length].id,
    createdAt: iso(-100 + index),
    updatedAt: iso(-1),
    deletedAt: null,
    name: locationNames[index],
    city: cities[index % cities.length],
    country: countries[index % countries.length],
    latitude: 25 + index * 0.7,
    longitude: -120 + index * 1.1
  }));

  const assets: Asset[] = Array.from({ length: 300 }, (_, index) => ({
    id: makeId("asset", index),
    tenantId: tenants[index % tenants.length].id,
    createdAt: iso(-80 + (index % 40)),
    updatedAt: iso(-1),
    deletedAt: null,
    vendorId: vendors[index % vendors.length].id,
    locationId: locations[index % locations.length].id,
    name: `${cities[index % cities.length].toLowerCase().replace(/\s+/g, "-")}-${(["router", "switch", "tower", "server", "olt"] as const)[index % 5]}-${String(index + 1).padStart(3, "0")}`,
    assetType: (["router", "switch", "tower", "server", "olt"] as const)[index % 5],
    status: (["online", "offline", "maintenance"] as const)[index % 3]
  }));

  const networkElements: NetworkElement[] = Array.from({ length: 100 }, (_, index) => ({
    id: makeId("ne", index),
    tenantId: assets[index].tenantId,
    createdAt: assets[index].createdAt,
    updatedAt: iso(-1),
    deletedAt: null,
    assetId: assets[index].id,
    locationId: assets[index].locationId,
    hostname: `${cities[index % cities.length].toLowerCase().replace(/\s+/g, "-")}-${(["core", "edge", "ran", "agg"] as const)[index % 4]}-${String(index + 1).padStart(2, "0")}.telecosync.net`,
    technology: (["4g", "5g", "fiber", "mpls"] as const)[index % 4],
    capacityUtilization: 40 + (index % 55)
  }));

  const networkInterfaces: NetworkInterface[] = Array.from({ length: 300 }, (_, index) => ({
    id: makeId("iface", index),
    tenantId: networkElements[index % networkElements.length].tenantId,
    createdAt: iso(-40 + (index % 10)),
    updatedAt: iso(-1),
    deletedAt: null,
    networkElementId: networkElements[index % networkElements.length].id,
    name: `xe-${index % 8}/${index % 4}/${index % 2}`,
    bandwidthGbps: [1, 10, 25, 100][index % 4],
    utilization: 20 + (index % 70)
  }));

  const provisioningTasks: ProvisioningTask[] = Array.from({ length: 400 }, (_, index) => ({
    id: makeId("prov", index),
    tenantId: serviceInstances[index % serviceInstances.length].tenantId,
    createdAt: iso(-18 + (index % 8)),
    updatedAt: iso(-1),
    deletedAt: null,
    serviceInstanceId: serviceInstances[index % serviceInstances.length].id,
    taskType: (["sim_activation", "router_config", "line_test", "ip_assign"] as const)[index % 4],
    status: (["queued", "running", "done", "failed"] as const)[index % 4]
  }));

  const workOrders: WorkOrder[] = Array.from({ length: 240 }, (_, index) => ({
    id: makeId("wo", index),
    tenantId: serviceInstances[index % serviceInstances.length].tenantId,
    createdAt: iso(-14 + (index % 6)),
    updatedAt: iso(-1),
    deletedAt: null,
    serviceInstanceId: serviceInstances[index % serviceInstances.length].id,
    description: `Dispatch work order ${index + 1}`,
    status: (["scheduled", "assigned", "completed"] as const)[index % 3],
    assignedTo: users[(index % (users.length - 1)) + 1].name
  }));

  const alarms: Alarm[] = Array.from({ length: 100 }, (_, index) => ({
    id: makeId("alarm", index),
    tenantId: networkElements[index % networkElements.length].tenantId,
    createdAt: iso(-(index % 7), index % 24),
    updatedAt: iso(-1),
    deletedAt: null,
    networkElementId: networkElements[index % networkElements.length].id,
    severity: alarmSeverities[index % alarmSeverities.length],
    summary: [
      "Optical signal degradation detected",
      "Cell congestion threshold exceeded",
      "Packet loss spike on uplink",
      "Core session setup failures rising",
      "Power module redundancy lost"
    ][index % 5] + ` on ${networkElements[index % networkElements.length].hostname}`,
    status: (["open", "acknowledged", "cleared"] as const)[index % 3]
  }));

  const incidents: Incident[] = Array.from({ length: 50 }, (_, index) => ({
    id: makeId("incident", index),
    tenantId: alarms[index].tenantId,
    createdAt: alarms[index].createdAt,
    updatedAt: iso(-1),
    deletedAt: null,
    alarmId: alarms[index].id,
    summary: `Service-impacting incident for ${cities[index % cities.length]} region`,
    priority: ticketPriorities[index % ticketPriorities.length],
    status: (["open", "triaged", "in_progress", "resolved"] as const)[index % 4]
  }));

  const troubleTickets: TroubleTicket[] = Array.from({ length: 150 }, (_, index) => ({
    id: makeId("tt", index),
    tenantId: customers[index % customers.length].tenantId,
    createdAt: iso(-(index % 11)),
    updatedAt: iso(-1),
    deletedAt: null,
    customerId: customers[index % customers.length].id,
    incidentId: index < incidents.length ? incidents[index].id : undefined,
    summary: [
      "Activation delayed after SIM swap",
      "Business broadband latency complaint",
      "Invoice dispute on roaming charges",
      "Managed router replacement request",
      "Private 5G slice throughput concern"
    ][index % 5],
    priority: ticketPriorities[index % ticketPriorities.length],
    status: (["open", "triaged", "in_progress", "resolved"] as const)[index % 4]
  }));

  const workflows: Workflow[] = [
    "Customer onboarding",
    "Order fulfillment",
    "Service activation",
    "Fault resolution",
    "Invoice dunning",
    "Field dispatch"
  ].map((name, index) => ({
    id: makeId("workflow", index),
    tenantId: tenants[index % tenants.length].id,
    createdAt: iso(-50 + index),
    updatedAt: iso(-1),
    deletedAt: null,
    name,
    trigger: ["customer.created", "order.created", "service.approved", "alarm.opened", "invoice.overdue", "workorder.created"][index],
    status: index % 5 === 0 ? "paused" : "active",
    successRate: 82 + index * 2.1
  }));

  const eventLogs: EventLog[] = Array.from({ length: 500 }, (_, index) => ({
    id: makeId("event", index),
    tenantId: tenants[index % tenants.length].id,
    createdAt: iso(-(index % 15), index % 24),
    updatedAt: iso(-(index % 15), index % 24),
    deletedAt: null,
    entityType: ["customer", "order", "invoice", "service", "alarm"][index % 5],
    entityId: makeId("entity", index),
    action: ["created", "updated", "validated", "completed", "acknowledged"][index % 5],
    actor: users[index % users.length].email
  }));

  const contracts: Contract[] = Array.from({ length: 10 }, (_, index) => ({
    id: makeId("contract", index),
    tenantId: customers[index].tenantId,
    createdAt: iso(-120 + index),
    updatedAt: iso(-1),
    deletedAt: null,
    customerId: customers[index].id,
    name: `${customers[index].name} Master Services Agreement`,
    value: 120000 + index * 25000,
    endDate: iso(180 + index * 10)
  }));

  const slas: SLA[] = contracts.map((contract, index) => ({
    id: makeId("sla", index),
    tenantId: contract.tenantId,
    createdAt: contract.createdAt,
    updatedAt: iso(-1),
    deletedAt: null,
    contractId: contract.id,
    name: `Gold SLA ${index + 1}`,
    uptimeTarget: 99.9,
    latencyTargetMs: 15 + index
  }));

  const performanceMetrics: PerformanceMetric[] = Array.from({ length: 400 }, (_, index) => ({
    id: makeId("metric", index),
    tenantId: networkElements[index % networkElements.length].tenantId,
    createdAt: iso(-(index % 10)),
    updatedAt: iso(-1),
    deletedAt: null,
    networkElementId: networkElements[index % networkElements.length].id,
    metric: (["latency", "packet_loss", "bandwidth", "uptime"] as const)[index % 4],
    value: Number((index % 4 === 3 ? 99.5 + (index % 5) * 0.08 : 1 + (index % 20) * 1.7).toFixed(2)),
    timestamp: iso(-(index % 10), index % 24)
  }));

  const documents: DocumentRecord[] = Array.from({ length: 40 }, (_, index) => ({
    id: makeId("doc", index),
    tenantId: tenants[index % tenants.length].id,
    createdAt: iso(-40 + index),
    updatedAt: iso(-1),
    deletedAt: null,
    name: `${["msa", "sla", "technical-runbook", "invoice-pack"][index % 4]}-${slugify(tenants[index % tenants.length].name)}-${index + 1}.pdf`,
    bucket: "telecosync-documents",
    path: `tenant-${index % tenants.length}/document-${index + 1}.pdf`,
    documentType: (["contract", "sla", "technical", "invoice"] as const)[index % 4]
  }));

  const notifications: Notification[] = Array.from({ length: 120 }, (_, index) => ({
    id: makeId("notification", index),
    tenantId: tenants[index % tenants.length].id,
    createdAt: iso(-(index % 7)),
    updatedAt: iso(-1),
    deletedAt: null,
    channel: (["email", "sms", "in_app"] as const)[index % 3],
    title: ["Billing threshold alert", "Critical network fault", "Order milestone update"][index % 3],
    category: (["billing", "fault", "order"] as const)[index % 3],
    read: index % 4 === 0
  }));

  return {
    tenants,
    roles,
    permissions,
    users,
    customers,
    accounts,
    contacts,
    subscriptions,
    products,
    productPlans,
    pricingRules,
    promotions,
    bundles,
    services,
    serviceInstances,
    orders,
    orderItems,
    fulfillmentTasks,
    usageRecords,
    ratingRules,
    billingCycles,
    invoices,
    payments,
    vendors,
    locations,
    assets,
    networkElements,
    networkInterfaces,
    provisioningTasks,
    workOrders,
    alarms,
    incidents,
    troubleTickets,
    workflows,
    eventLogs,
    contracts,
    slas,
    performanceMetrics,
    documents,
    notifications
  };
}

export interface CustomerOnboardingInput {
  tenantId?: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  segment: Customer["segment"];
  supportTier: string;
  productId: string;
}

export interface ProductInput {
  tenantId?: string;
  name: string;
  family: Product["family"];
  version: string;
  basePrice: number;
  slaTarget: number;
  downloadMbps: number;
  uploadMbps: number;
  dataLimitGb: number;
}

export interface WorkflowInput {
  tenantId?: string;
  name: string;
  trigger: string;
}

export interface UserInput {
  tenantId?: string;
  email: string;
  password: string;
  name: string;
  role: string;
  title: string;
}

const globalStore = globalThis as typeof globalThis & {
  __telecosyncDataset?: PlatformDataset;
};

function datasetRef() {
  if (!globalStore.__telecosyncDataset) {
    globalStore.__telecosyncDataset = generateDataset();
  }

  return globalStore.__telecosyncDataset;
}

export function getDataset() {
  return datasetRef();
}

export function resetDataset() {
  globalStore.__telecosyncDataset = generateDataset();
  return datasetRef();
}

export function getSafeUsers(): SafeUser[] {
  const dataset = datasetRef();
  return dataset.users.map(({ password, ...user }) => user);
}

export function getUserByEmail(email: string) {
  const dataset = datasetRef();
  return dataset.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function authenticateUser(email: string, password: string) {
  const user = getUserByEmail(email);
  if (!user || user.password !== password) {
    return null;
  }

  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export function getUserById(userId: string) {
  const dataset = datasetRef();
  const user = dataset.users.find((item) => item.id === userId);
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function nextEntityId(prefix: string, items: { id: string }[]) {
  return `${prefix}_${String(items.length + 1).padStart(4, "0")}`;
}

export function createCustomerOnboarding(input: CustomerOnboardingInput) {
  const dataset = datasetRef();
  const tenantId = input.tenantId ?? dataset.tenants[0].id;
  const product = dataset.products.find((item) => item.id === input.productId) ?? dataset.products[0];
  const service = dataset.services.find((item) => item.tenantId === tenantId && item.category === "connectivity") ?? dataset.services[0];
  const createdAt = new Date().toISOString();

  const customer: Customer = {
    id: nextEntityId("customer", dataset.customers),
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    accountId: nextEntityId("account", dataset.accounts),
    name: input.name,
    segment: input.segment,
    lifecycleStage: "active",
    monthlyRevenue: product.basePrice,
    churnRisk: 12,
    satisfaction: 82,
    supportTier: input.supportTier,
    city: input.city
  };

  const account: Account = {
    id: customer.accountId,
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    customerId: customer.id,
    status: "active",
    balance: 0,
    creditClass: input.segment === "consumer" ? "silver" : "gold"
  };

  const contact: Contact = {
    id: nextEntityId("contact", dataset.contacts),
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    customerId: customer.id,
    email: input.email,
    phone: input.phone,
    role: input.segment === "consumer" ? "Primary Contact" : "Operations Manager"
  };

  const subscription: Subscription = {
    id: nextEntityId("subscription", dataset.subscriptions),
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    customerId: customer.id,
    serviceId: service.id,
    productId: product.id,
    status: "active",
    monthlyCharge: product.basePrice,
    usageGb: 0
  };

  const serviceInstance: ServiceInstance = {
    id: nextEntityId("svcinst", dataset.serviceInstances),
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    serviceId: service.id,
    subscriptionId: subscription.id,
    status: "active",
    uptime: 100
  };

  const order: Order = {
    id: nextEntityId("order", dataset.orders),
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    customerId: customer.id,
    status: "completed",
    total: product.basePrice,
    channel: "portal"
  };

  const orderItem: OrderItem = {
    id: nextEntityId("orderitem", dataset.orderItems),
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    orderId: order.id,
    productId: product.id,
    quantity: 1,
    fulfillmentState: "done"
  };

  const fulfillmentTemplates = ["Validate commercial profile", "Reserve service resources", "Activate service instance"];
  const fulfillmentBase = dataset.fulfillmentTasks.length;
  const fulfillmentTasks: FulfillmentTask[] = fulfillmentTemplates.map((name, index) => ({
    id: `ftask_${String(fulfillmentBase + index + 1).padStart(4, "0")}`,
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    orderId: order.id,
    name,
    owner: name === "Validate commercial profile" ? "sales-ops" : "orchestration",
    status: "done"
  }));

  const cycle = dataset.billingCycles.find((item) => item.status === "open") ?? dataset.billingCycles[0];
  const invoice: Invoice = {
    id: nextEntityId("invoice", dataset.invoices),
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    customerId: customer.id,
    cycleId: cycle.id,
    total: Number((product.basePrice * 1.18).toFixed(2)),
    tax: Number((product.basePrice * 0.18).toFixed(2)),
    status: "issued",
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString()
  };

  const payment: Payment = {
    id: nextEntityId("payment", dataset.payments),
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    invoiceId: invoice.id,
    amount: invoice.total,
    method: "bank",
    status: "pending"
  };

  const eventLog: EventLog = {
    id: nextEntityId("event", dataset.eventLogs),
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    entityType: "customer",
    entityId: customer.id,
    action: "onboarded",
    actor: "admin@telecosync.com"
  };

  const invoiceEmailEventLog: EventLog = {
    id: `event_${String(dataset.eventLogs.length + 2).padStart(4, "0")}`,
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    entityType: "invoice",
    entityId: invoice.id,
    action: "emailed",
    actor: contact.email
  };

  const notification: Notification = {
    id: nextEntityId("notification", dataset.notifications),
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    channel: "in_app",
    title: onboardingSummary(product.name, customer.name),
    category: "order",
    read: false
  };

  const billingEmailNotification: Notification = {
    id: `notification_${String(dataset.notifications.length + 2).padStart(4, "0")}`,
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    channel: "email",
    title: `Invoice ${invoice.id} sent to ${contact.email}`,
    category: "billing",
    read: false
  };

  dataset.customers.unshift(customer);
  dataset.accounts.unshift(account);
  dataset.contacts.unshift(contact);
  dataset.subscriptions.unshift(subscription);
  dataset.serviceInstances.unshift(serviceInstance);
  dataset.orders.unshift(order);
  dataset.orderItems.unshift(orderItem);
  dataset.fulfillmentTasks.unshift(...fulfillmentTasks);
  dataset.invoices.unshift(invoice);
  dataset.payments.unshift(payment);
  dataset.eventLogs.unshift(eventLog);
  dataset.eventLogs.unshift(invoiceEmailEventLog);
  dataset.notifications.unshift(notification);
  dataset.notifications.unshift(billingEmailNotification);

  return {
    customer,
    account,
    contact,
    subscription,
    serviceInstance,
    order,
    invoice,
    payment
  };
}

export function createProduct(input: ProductInput) {
  const dataset = datasetRef();
  const tenantId = input.tenantId ?? dataset.tenants[0].id;
  const createdAt = new Date().toISOString();

  const product: Product = {
    id: nextEntityId("product", dataset.products),
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    name: input.name,
    family: input.family,
    version: input.version,
    basePrice: input.basePrice,
    slaTarget: input.slaTarget
  };

  const plan: ProductPlan = {
    id: nextEntityId("plan", dataset.productPlans),
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    productId: product.id,
    name: `${input.name} plan`,
    downloadMbps: input.downloadMbps,
    uploadMbps: input.uploadMbps,
    dataLimitGb: input.dataLimitGb
  };

  const pricingRule: PricingRule = {
    id: nextEntityId("pricing", dataset.pricingRules),
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    productId: product.id,
    ruleType: "base",
    expression: `base_price(${input.basePrice.toFixed(2)})`
  };

  dataset.products.unshift(product);
  dataset.productPlans.unshift(plan);
  dataset.pricingRules.unshift(pricingRule);
  dataset.eventLogs.unshift({
    id: nextEntityId("event", dataset.eventLogs),
    tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    entityType: "product",
    entityId: product.id,
    action: "created",
    actor: "product@telecosync.com"
  });

  return { product, plan, pricingRule };
}

export function createUser(input: UserInput) {
  const dataset = datasetRef();
  if (getUserByEmail(input.email)) {
    throw new Error("A user with this email already exists");
  }

  const createdAt = new Date().toISOString();
  const user: DemoUser = {
    id: nextEntityId("user", dataset.users),
    tenantId: input.tenantId ?? dataset.tenants[0].id,
    email: input.email,
    password: input.password,
    name: input.name,
    role: input.role,
    title: input.title
  };

  dataset.users.unshift(user);
  dataset.eventLogs.unshift({
    id: nextEntityId("event", dataset.eventLogs),
    tenantId: user.tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    entityType: "user",
    entityId: user.id,
    action: "created",
    actor: "admin@telecosync.com"
  });

  const { password, ...safeUser } = user;
  return safeUser;
}

export function createWorkflow(input: WorkflowInput) {
  const dataset = datasetRef();
  const createdAt = new Date().toISOString();
  const workflow: Workflow = {
    id: nextEntityId("workflow", dataset.workflows),
    tenantId: input.tenantId ?? dataset.tenants[0].id,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    name: input.name,
    trigger: input.trigger,
    status: "active",
    successRate: 96.2
  };

  dataset.workflows.unshift(workflow);
  dataset.eventLogs.unshift({
    id: nextEntityId("event", dataset.eventLogs),
    tenantId: workflow.tenantId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    entityType: "workflow",
    entityId: workflow.id,
    action: "created",
    actor: "workflow@telecosync.com"
  });

  return workflow;
}

export function setWorkflowStatus(workflowId: string, status: Workflow["status"]) {
  const dataset = datasetRef();
  const workflow = dataset.workflows.find((item) => item.id === workflowId);
  if (!workflow) {
    throw new Error("Workflow not found");
  }

  workflow.status = status;
  workflow.updatedAt = new Date().toISOString();

  dataset.eventLogs.unshift({
    id: nextEntityId("event", dataset.eventLogs),
    tenantId: workflow.tenantId,
    createdAt: workflow.updatedAt,
    updatedAt: workflow.updatedAt,
    deletedAt: null,
    entityType: "workflow",
    entityId: workflow.id,
    action: status === "active" ? "resumed" : "paused",
    actor: "workflow@telecosync.com"
  });

  return workflow;
}

export function runWorkflow(workflowId: string) {
  const dataset = datasetRef();
  const workflow = dataset.workflows.find((item) => item.id === workflowId);
  if (!workflow) {
    throw new Error("Workflow not found");
  }
  if (workflow.status !== "active") {
    throw new Error("Workflow must be active before it can be run");
  }

  const executedAt = new Date().toISOString();
  workflow.updatedAt = executedAt;
  workflow.successRate = Number(Math.min(99.4, workflow.successRate + 0.2).toFixed(1));

  dataset.notifications.unshift({
    id: nextEntityId("notification", dataset.notifications),
    tenantId: workflow.tenantId,
    createdAt: executedAt,
    updatedAt: executedAt,
    deletedAt: null,
    channel: "in_app",
    title: `${workflow.name} workflow executed successfully`,
    category: "order",
    read: false
  });

  dataset.eventLogs.unshift({
    id: nextEntityId("event", dataset.eventLogs),
    tenantId: workflow.tenantId,
    createdAt: executedAt,
    updatedAt: executedAt,
    deletedAt: null,
    entityType: "workflow",
    entityId: workflow.id,
    action: "executed",
    actor: "workflow@telecosync.com"
  });

  return {
    workflow,
    executedAt
  };
}

export function paginate<T>(items: T[], page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
    totalPages: Math.ceil(items.length / pageSize)
  };
}

export function buildKpis(): AnalyticsKpi[] {
  const dataset = datasetRef();
  const revenue = dataset.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paid = dataset.payments.filter((payment) => payment.status === "received").reduce((sum, payment) => sum + payment.amount, 0);
  const critical = dataset.alarms.filter((alarm) => alarm.severity === "critical" && alarm.status !== "cleared").length;
  const activeOrders = dataset.orders.filter((order) => order.status !== "completed").length;

  return [
    { label: "Recognized revenue", value: `$${Math.round(revenue / 1000)}K`, delta: "+8.2%" },
    { label: "Cash collected", value: `$${Math.round(paid / 1000)}K`, delta: "+5.1%" },
    { label: "Open orchestration", value: String(activeOrders), delta: "-4.3%" },
    { label: "Critical alarms", value: String(critical), delta: "-12.0%" }
  ];
}

export function revenueSeries(): TimeSeriesPoint[] {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((label, index) => ({
    label,
    value: 220 + index * 15 + (index % 3) * 20
  }));
}

export function networkSeries(): TimeSeriesPoint[] {
  return ["Core", "RAN", "Transport", "Fiber", "IoT", "Private 5G"].map((label, index) => ({
    label,
    value: 78 + index * 3.4
  }));
}
