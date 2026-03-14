import { AccessDenied } from "@/components/access-denied";
import { AnalyticsWorkspace } from "@/components/analytics-workspace";
import { getSessionUserFromCookies } from "@/lib/auth";
import { canAccessResource } from "@/lib/rbac";

export default function AnalyticsPage() {
  const user = getSessionUserFromCookies();
  if (!canAccessResource(user?.role, "analytics")) {
    return <AccessDenied title="Analytics" />;
  }

  return <AnalyticsWorkspace />;
}
