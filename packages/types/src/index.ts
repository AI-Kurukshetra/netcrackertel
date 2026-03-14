export type TenantTier = "enterprise" | "growth" | "mvno";
export type ThemeMode = "light" | "dark" | "system";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "open" | "triaged" | "in_progress" | "resolved";
export type OrderStatus = "captured" | "validated" | "provisioning" | "completed" | "blocked";
export type InvoiceStatus = "draft" | "issued" | "paid" | "overdue";
export type AlarmSeverity = "info" | "warning" | "major" | "critical";

export interface AuditFields {
  id: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface TelecomCompany extends AuditFields {
  name: string;
  code: string;
  region: string;
  tier: TenantTier;
  arr: number;
  subscribers: number;
  activeServices: number;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
}

export interface DemoUser {
  id: string;
  tenantId: string;
  email: string;
  password: string;
  name: string;
  role: string;
  title: string;
}

export interface SafeUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  title: string;
}

export interface Customer extends AuditFields {
  accountId: string;
  name: string;
  segment: "consumer" | "business" | "government" | "iot";
  lifecycleStage: "lead" | "active" | "at_risk" | "inactive";
  monthlyRevenue: number;
  churnRisk: number;
  satisfaction: number;
  supportTier: string;
  city: string;
}

export interface Account extends AuditFields {
  customerId: string;
  status: "active" | "pending" | "suspended";
  balance: number;
  creditClass: "bronze" | "silver" | "gold" | "platinum";
}

export interface Contact extends AuditFields {
  customerId: string;
  email: string;
  phone: string;
  role: string;
}

export interface Subscription extends AuditFields {
  customerId: string;
  serviceId: string;
  productId: string;
  status: "active" | "pending" | "paused";
  monthlyCharge: number;
  usageGb: number;
}

export interface Product extends AuditFields {
  name: string;
  family: "mobile" | "broadband" | "iot" | "private_5g" | "voice";
  version: string;
  basePrice: number;
  slaTarget: number;
}

export interface ProductPlan extends AuditFields {
  productId: string;
  name: string;
  downloadMbps: number;
  uploadMbps: number;
  dataLimitGb: number;
}

export interface PricingRule extends AuditFields {
  productId: string;
  ruleType: "base" | "usage" | "discount" | "roaming";
  expression: string;
}

export interface Promotion extends AuditFields {
  name: string;
  productId: string;
  discountPercent: number;
  active: boolean;
}

export interface Bundle extends AuditFields {
  name: string;
  productIds: string[];
  price: number;
}

export interface Service extends AuditFields {
  name: string;
  category: "connectivity" | "managed" | "voice" | "security";
  status: "active" | "planned" | "degraded";
}

export interface ServiceInstance extends AuditFields {
  serviceId: string;
  subscriptionId: string;
  status: "active" | "provisioning" | "suspended";
  uptime: number;
}

export interface Order extends AuditFields {
  customerId: string;
  status: OrderStatus;
  total: number;
  channel: "portal" | "sales" | "partner" | "api";
}

export interface OrderItem extends AuditFields {
  orderId: string;
  productId: string;
  quantity: number;
  fulfillmentState: "queued" | "running" | "done" | "failed";
}

export interface FulfillmentTask extends AuditFields {
  orderId: string;
  name: string;
  owner: string;
  status: "queued" | "running" | "done" | "blocked";
}

export interface UsageRecord extends AuditFields {
  subscriptionId: string;
  metric: "data" | "voice" | "sms" | "iot_message";
  quantity: number;
  cost: number;
  occurredAt: string;
}

export interface RatingRule extends AuditFields {
  metric: string;
  unitPrice: number;
  currency: string;
}

export interface BillingCycle extends AuditFields {
  name: string;
  periodStart: string;
  periodEnd: string;
  status: "open" | "rating" | "closed";
}

export interface Invoice extends AuditFields {
  customerId: string;
  cycleId: string;
  total: number;
  tax: number;
  status: InvoiceStatus;
  dueDate: string;
}

export interface Payment extends AuditFields {
  invoiceId: string;
  amount: number;
  method: "card" | "bank" | "wallet" | "direct_debit";
  status: "received" | "pending" | "failed";
}

export interface Vendor extends AuditFields {
  name: string;
  category: "core" | "radio" | "transport" | "cloud";
  score: number;
}

export interface Location extends AuditFields {
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Asset extends AuditFields {
  vendorId: string;
  locationId: string;
  name: string;
  assetType: "router" | "switch" | "tower" | "server" | "olt";
  status: "online" | "offline" | "maintenance";
}

export interface NetworkElement extends AuditFields {
  assetId: string;
  locationId: string;
  hostname: string;
  technology: "4g" | "5g" | "fiber" | "mpls";
  capacityUtilization: number;
}

export interface NetworkInterface extends AuditFields {
  networkElementId: string;
  name: string;
  bandwidthGbps: number;
  utilization: number;
}

export interface WorkOrder extends AuditFields {
  serviceInstanceId: string;
  description: string;
  status: "scheduled" | "assigned" | "completed";
  assignedTo: string;
}

export interface ProvisioningTask extends AuditFields {
  serviceInstanceId: string;
  taskType: "sim_activation" | "router_config" | "line_test" | "ip_assign";
  status: "queued" | "running" | "done" | "failed";
}

export interface Alarm extends AuditFields {
  networkElementId: string;
  severity: AlarmSeverity;
  summary: string;
  status: "open" | "acknowledged" | "cleared";
}

export interface Incident extends AuditFields {
  alarmId: string;
  summary: string;
  priority: TicketPriority;
  status: TicketStatus;
}

export interface TroubleTicket extends AuditFields {
  customerId: string;
  incidentId?: string;
  summary: string;
  priority: TicketPriority;
  status: TicketStatus;
}

export interface Workflow extends AuditFields {
  name: string;
  trigger: string;
  status: "active" | "paused";
  successRate: number;
}

export interface EventLog extends AuditFields {
  entityType: string;
  entityId: string;
  action: string;
  actor: string;
}

export interface Contract extends AuditFields {
  customerId: string;
  name: string;
  value: number;
  endDate: string;
}

export interface SLA extends AuditFields {
  contractId: string;
  name: string;
  uptimeTarget: number;
  latencyTargetMs: number;
}

export interface PerformanceMetric extends AuditFields {
  networkElementId: string;
  metric: "latency" | "packet_loss" | "bandwidth" | "uptime";
  value: number;
  timestamp: string;
}

export interface DocumentRecord extends AuditFields {
  name: string;
  bucket: string;
  path: string;
  documentType: "contract" | "sla" | "technical" | "invoice";
}

export interface Notification extends AuditFields {
  channel: "email" | "sms" | "in_app";
  title: string;
  category: "billing" | "fault" | "order";
  read: boolean;
}

export interface AnalyticsKpi {
  label: string;
  value: string;
  delta: string;
}

export interface TimeSeriesPoint {
  label: string;
  value: number;
}

export interface PlatformDataset {
  tenants: TelecomCompany[];
  roles: Role[];
  permissions: Permission[];
  users: DemoUser[];
  customers: Customer[];
  accounts: Account[];
  contacts: Contact[];
  subscriptions: Subscription[];
  products: Product[];
  productPlans: ProductPlan[];
  pricingRules: PricingRule[];
  promotions: Promotion[];
  bundles: Bundle[];
  services: Service[];
  serviceInstances: ServiceInstance[];
  orders: Order[];
  orderItems: OrderItem[];
  fulfillmentTasks: FulfillmentTask[];
  usageRecords: UsageRecord[];
  ratingRules: RatingRule[];
  billingCycles: BillingCycle[];
  invoices: Invoice[];
  payments: Payment[];
  vendors: Vendor[];
  locations: Location[];
  assets: Asset[];
  networkElements: NetworkElement[];
  networkInterfaces: NetworkInterface[];
  provisioningTasks: ProvisioningTask[];
  workOrders: WorkOrder[];
  alarms: Alarm[];
  incidents: Incident[];
  troubleTickets: TroubleTicket[];
  workflows: Workflow[];
  eventLogs: EventLog[];
  contracts: Contract[];
  slas: SLA[];
  performanceMetrics: PerformanceMetric[];
  documents: DocumentRecord[];
  notifications: Notification[];
}
