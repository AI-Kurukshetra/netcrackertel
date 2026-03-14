import test from "node:test";
import assert from "node:assert/strict";
import { buildApiResponse } from "../../../packages/api/src/index";

test("api response paginates orders", () => {
  const response = buildApiResponse("orders", { role: "Admin", tenantId: "tenant_0001" }, { page: 2, pageSize: 25 });
  const body = response.body as { page: number; pageSize: number; total: number };

  assert.equal(response.status, 200);
  assert.equal(body.page, 2);
  assert.equal(body.pageSize, 25);
  assert.equal(body.total, 2000);
});

test("rbac denies unsupported access", () => {
  const response = buildApiResponse("admin", { role: "Support Agent", tenantId: "tenant_0001" });

  assert.equal(response.status, 403);
});

test("billing manager can access billing workspace", () => {
  const response = buildApiResponse("billing", { role: "Billing Manager", tenantId: "tenant_0001" });

  assert.equal(response.status, 200);
});
