import { AccessDenied } from "@/components/access-denied";
import { WorkflowsWorkspace } from "@/components/workflows-workspace";
import { getSessionUserFromCookies } from "@/lib/auth";
import { canAccessResource } from "@/lib/rbac";

export default function WorkflowsPage() {
  const user = getSessionUserFromCookies();
  if (!canAccessResource(user?.role, "workflows")) {
    return <AccessDenied title="Workflow automation" />;
  }

  return <WorkflowsWorkspace />;
}
