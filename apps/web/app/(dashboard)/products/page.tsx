import { ProductsWorkspace } from "@/components/products-workspace";
import { AccessDenied } from "@/components/access-denied";
import { getSessionUserFromCookies } from "@/lib/auth";
import { canAccessResource } from "@/lib/rbac";

export default function ProductsPage() {
  const user = getSessionUserFromCookies();
  if (!canAccessResource(user?.role, "products")) {
    return <AccessDenied title="Product catalog" />;
  }

  return <ProductsWorkspace />;
}
