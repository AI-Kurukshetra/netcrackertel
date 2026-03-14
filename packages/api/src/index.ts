import { getAiSignals, getAnalyticsSummary, getAuditFeed, getCollection, getDashboardSnapshot } from "@telecosync/services";

export interface ApiContext {
  role?: string;
  tenantId?: string;
}

export interface PaginationInput {
  page?: number;
  pageSize?: number;
  search?: string;
}

const rolePermissions: Record<string, string[]> = {
  Admin: ["*"],
  "Network Engineer": ["dashboard", "network", "inventory", "faults", "performance", "analytics", "services", "notifications", "documents"],
  "Support Agent": ["dashboard", "customers", "faults", "orders", "services", "notifications", "documents"],
  "Billing Manager": ["dashboard", "billing", "analytics", "reports", "customers", "orders", "notifications", "documents"],
  "Product Manager": ["dashboard", "products", "analytics", "orders", "customers", "notifications", "documents"],
  "Field Technician": ["dashboard", "services", "workflows", "orders", "faults", "inventory", "notifications", "documents"]
};

export function authorize(context: ApiContext, resource: string) {
  const allowed = rolePermissions[context.role ?? "Admin"] ?? [];
  if (!allowed.includes("*") && !allowed.includes(resource)) {
    return {
      ok: false,
      error: {
        code: "forbidden",
        message: `Role ${context.role ?? "unknown"} cannot access ${resource}`
      }
    };
  }

  return { ok: true };
}

export function validatePagination(input: PaginationInput) {
  return {
    page: input.page && input.page > 0 ? input.page : 1,
    pageSize: input.pageSize && input.pageSize > 0 ? Math.min(input.pageSize, 100) : 10,
    search: input.search ?? ""
  };
}

export function buildApiResponse(resource: string, context: ApiContext, input: PaginationInput = {}) {
  const auth = authorize(context, resource);
  if (!auth.ok) {
    return { status: 403, body: auth.error };
  }

  const page = validatePagination(input);
  const collectionMap = {
    customers: "customers",
    products: "products",
    orders: "orders",
    billing: "invoices",
    inventory: "assets",
    services: "serviceInstances",
    network: "networkElements",
    faults: "alarms",
    performance: "performanceMetrics",
    workflows: "workflows",
    notifications: "notifications",
    documents: "documents",
    admin: "users",
    reports: "eventLogs"
  } as const;

  if (resource === "dashboard") {
    return { status: 200, body: getDashboardSnapshot() };
  }
  if (resource === "analytics") {
    return { status: 200, body: { ...getAnalyticsSummary(), aiSignals: getAiSignals() } };
  }
  if (resource === "audit") {
    return { status: 200, body: getAuditFeed() };
  }

  const key = collectionMap[resource as keyof typeof collectionMap];
  if (!key) {
    return {
      status: 404,
      body: { code: "not_found", message: `Unknown resource ${resource}` }
    };
  }

  return {
    status: 200,
    body: getCollection(key, page.page, page.pageSize, page.search)
  };
}
