import { AccessDenied } from "@/components/access-denied";
import { BillingWorkspace } from "@/components/billing-workspace";
import { getSessionUserFromCookies } from "@/lib/auth";
import { canAccessResource } from "@/lib/rbac";

export default function BillingPage() {
  const user = getSessionUserFromCookies();
  if (!canAccessResource(user?.role, "billing")) {
    return <AccessDenied title="Billing operations" />;
  }

  return <BillingWorkspace />;
}
