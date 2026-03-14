export const rolePermissions: Record<string, string[]> = {
  Admin: ["*"],
  "Network Engineer": ["dashboard", "network", "inventory", "faults", "performance", "analytics", "services", "notifications", "documents"],
  "Support Agent": ["dashboard", "customers", "faults", "orders", "services", "notifications", "documents"],
  "Billing Manager": ["dashboard", "billing", "analytics", "reports", "customers", "orders", "notifications", "documents"],
  "Product Manager": ["dashboard", "products", "analytics", "orders", "customers", "notifications", "documents"],
  "Field Technician": ["dashboard", "services", "workflows", "orders", "faults", "inventory", "notifications", "documents"]
};

export function canAccessResource(role: string | undefined, resource: string) {
  const allowed = rolePermissions[role ?? ""] ?? [];
  return allowed.includes("*") || allowed.includes(resource);
}
