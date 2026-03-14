import { AccessDenied } from "@/components/access-denied";
import { LifecycleWorkspace } from "@/components/lifecycle-workspace";
import { getSessionUserFromCookies } from "@/lib/auth";
import { canAccessResource } from "@/lib/rbac";

export default function OrdersPage() {
  const user = getSessionUserFromCookies();
  if (!canAccessResource(user?.role, "orders")) {
    return <AccessDenied title="Order management" />;
  }

  return <LifecycleWorkspace mode="orders" />;
}
