import test from "node:test";
import assert from "node:assert/strict";
import { authenticateUser, createCustomerOnboarding, createProduct, createUser, createWorkflow, getDataset, resetDataset, runWorkflow, setWorkflowStatus } from "../../../packages/database/src/index";

test("seeded demo dataset matches requested volumes", () => {
  resetDataset();
  const dataset = getDataset();

  assert.equal(dataset.tenants.length, 10);
  assert.equal(dataset.customers.length, 500);
  assert.equal(dataset.products.length, 50);
  assert.equal(dataset.bundles.length, 10);
  assert.equal(dataset.subscriptions.length, 1000);
  assert.equal(dataset.orders.length, 2000);
  assert.equal(dataset.invoices.length, 2000);
  assert.equal(dataset.usageRecords.length, 20000);
  assert.equal(dataset.networkElements.length, 100);
  assert.equal(dataset.assets.length, 300);
  assert.equal(dataset.alarms.length, 100);
  assert.equal(dataset.incidents.length, 50);
  assert.equal(dataset.vendors.length, 20);
  assert.equal(dataset.slas.length, 10);
  assert.equal(dataset.locations.length, 20);
});

test("customer onboarding creates linked operational entities", () => {
  resetDataset();
  const before = getDataset();
  const productId = before.products[0].id;

  const result = createCustomerOnboarding({
    name: "Evergreen Logistics Group",
    email: "ops@evergreen-logistics-group.corp.telecosync.test",
    phone: "+1-555-4400",
    city: "Dallas",
    segment: "business",
    supportTier: "priority",
    productId
  });

  const after = getDataset();

  assert.equal(result.customer.name, "Evergreen Logistics Group");
  assert.equal(after.customers.length, 501);
  assert.equal(after.orders.length, 2001);
  assert.equal(after.subscriptions.length, 1001);
  assert.equal(after.fulfillmentTasks.length, 1503);
  assert.equal(after.invoices.length, 2001);
  assert.equal(after.payments.length, 1401);
  assert.equal(result.invoice.status, "issued");
  assert.equal(after.notifications[0]?.channel, "email");
  assert.equal(after.notifications[0]?.category, "billing");
});

test("product creation updates catalog and plans", () => {
  resetDataset();

  const result = createProduct({
    name: "Managed Branch Fiber Ultra",
    family: "broadband",
    version: "v4.2",
    basePrice: 399,
    slaTarget: 99.95,
    downloadMbps: 2000,
    uploadMbps: 1000,
    dataLimitGb: 5000
  });

  const after = getDataset();

  assert.equal(result.product.name, "Managed Branch Fiber Ultra");
  assert.equal(after.products.length, 51);
  assert.equal(after.productPlans[0].productId, result.product.id);
});

test("admin-created users can authenticate", () => {
  resetDataset();
  const user = createUser({
    name: "Riya Sharma",
    email: "riya.sharma@telecosync.com",
    password: "support123",
    role: "Support Agent",
    title: "Tier 2 Support Agent"
  });

  const authenticated = authenticateUser("riya.sharma@telecosync.com", "support123");

  assert.equal(user.email, "riya.sharma@telecosync.com");
  assert.equal(authenticated?.role, "Support Agent");
});

test("workflow actions create, pause, and execute automations", () => {
  resetDataset();

  const workflow = createWorkflow({
    name: "Customer revenue safeguard",
    trigger: "invoice.overdue"
  });

  const paused = setWorkflowStatus(workflow.id, "paused");
  assert.equal(paused.status, "paused");

  const resumed = setWorkflowStatus(workflow.id, "active");
  const result = runWorkflow(workflow.id);

  assert.equal(resumed.status, "active");
  assert.equal(result.workflow.id, workflow.id);
  assert.equal(getDataset().notifications[0]?.title.includes(workflow.name), true);
});
