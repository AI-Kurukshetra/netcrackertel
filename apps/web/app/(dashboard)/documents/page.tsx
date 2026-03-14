import { AccessDenied } from "@/components/access-denied";
import { DocumentsWorkspace } from "@/components/documents-workspace";
import { getSessionUserFromCookies } from "@/lib/auth";
import { canAccessResource } from "@/lib/rbac";

export default function DocumentsPage() {
  const user = getSessionUserFromCookies();
  if (!canAccessResource(user?.role, "documents")) {
    return <AccessDenied title="Document management" />;
  }

  return <DocumentsWorkspace />;
}
