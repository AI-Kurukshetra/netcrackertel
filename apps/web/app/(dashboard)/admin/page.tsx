import { AdminWorkspace } from "@/components/admin-workspace";
import { AccessDenied } from "@/components/access-denied";
import { getSessionUserFromCookies } from "@/lib/auth";
import { canAccessResource } from "@/lib/rbac";

export default function AdminPage() {
  const user = getSessionUserFromCookies();
  if (!canAccessResource(user?.role, "admin")) {
    return <AccessDenied title="Administration" />;
  }

  return <AdminWorkspace />;
}
