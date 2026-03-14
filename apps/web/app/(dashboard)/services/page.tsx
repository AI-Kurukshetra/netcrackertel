import { AccessDenied } from "@/components/access-denied";
import { LifecycleWorkspace } from "@/components/lifecycle-workspace";
import { getSessionUserFromCookies } from "@/lib/auth";
import { canAccessResource } from "@/lib/rbac";

export default function ServicesPage() {
  const user = getSessionUserFromCookies();
  if (!canAccessResource(user?.role, "services")) {
    return <AccessDenied title="Service provisioning" />;
  }

  return <LifecycleWorkspace mode="services" />;
}
