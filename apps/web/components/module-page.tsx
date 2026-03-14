import { OperationsWorkspace } from "@/components/operations-workspace";
import { AccessDenied } from "@/components/access-denied";
import { getSessionUserFromCookies } from "@/lib/auth";
import { canAccessResource } from "@/lib/rbac";

export function ModulePage({
  endpoint,
  title,
  description
}: {
  endpoint: string;
  title: string;
  description: string;
}) {
  const user = getSessionUserFromCookies();
  if (!canAccessResource(user?.role, endpoint)) {
    return <AccessDenied title={title} />;
  }

  return <OperationsWorkspace endpoint={endpoint} title={title} description={description} />;
}
