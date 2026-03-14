export const moduleConfig = {
  customers: {
    title: "Customer lifecycle",
    description: "Profiles, subscriptions, complaints, support history, and lifecycle risk."
  },
  products: {
    title: "Product catalog",
    description: "Versioned telecom offers, pricing rules, promotions, and bundles."
  },
  orders: {
    title: "Order management",
    description: "Capture, validation, orchestration, and fulfillment progress."
  },
  billing: {
    title: "Billing engine",
    description: "Invoices, payments, rating rules, tax, and cycle operations."
  },
  inventory: {
    title: "Network inventory",
    description: "Assets, device inventory, topology nodes, locations, and vendors."
  },
  services: {
    title: "Service provisioning",
    description: "Service instances, provisioning automation, and field execution."
  },
  faults: {
    title: "Fault management",
    description: "Alarm correlation, incidents, and trouble ticket operations."
  },
  performance: {
    title: "Performance monitoring",
    description: "Latency, packet loss, bandwidth, uptime, and SLA control."
  },
  workflows: {
    title: "Workflow automation",
    description: "Customer onboarding, activation, dunning, and remediation playbooks."
  },
  notifications: {
    title: "Notification center",
    description: "Email, SMS, and in-app operational communications."
  },
  documents: {
    title: "Document management",
    description: "Contracts, SLAs, invoices, and technical records backed by Supabase Storage."
  },
  admin: {
    title: "Admin settings",
    description: "Users, roles, permissions, audit visibility, and tenancy controls."
  }
} as const;
