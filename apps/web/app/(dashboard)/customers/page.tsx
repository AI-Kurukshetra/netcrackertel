import { CustomersWorkspace } from "@/components/customers-workspace";
import { AccessDenied } from "@/components/access-denied";
import { getSessionUserFromCookies } from "@/lib/auth";
import { canAccessResource } from "@/lib/rbac";

export default function CustomersPage() {
  const user = getSessionUserFromCookies();
  if (!canAccessResource(user?.role, "customers")) {
    return <AccessDenied title="Customer management" />;
  }

  return <CustomersWorkspace />;
}
