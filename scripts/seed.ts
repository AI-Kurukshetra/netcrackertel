import { getDataset } from "../packages/database/src/index";

const dataset = getDataset();

console.log(JSON.stringify({
  tenants: dataset.tenants.length,
  customers: dataset.customers.length,
  products: dataset.products.length,
  bundles: dataset.bundles.length,
  subscriptions: dataset.subscriptions.length,
  orders: dataset.orders.length,
  invoices: dataset.invoices.length,
  usageRecords: dataset.usageRecords.length,
  networkElements: dataset.networkElements.length,
  assets: dataset.assets.length,
  alarms: dataset.alarms.length,
  incidents: dataset.incidents.length,
  vendors: dataset.vendors.length,
  slas: dataset.slas.length,
  locations: dataset.locations.length
}, null, 2));
