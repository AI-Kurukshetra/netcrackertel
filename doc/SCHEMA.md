# TelecoSync Schema

Supabase production schema assets live in `supabase/migrations`. The platform uses multi-tenant tables with `tenant_id`, audit fields, soft deletes, and RLS policies enforced via tenant membership and role claims. Bootstrap role and permission seeds live in `supabase/seed.sql`, and background job stubs live in `supabase/functions/`.

Planned table groups:
- Identity and RBAC: `users`, `roles`, `permissions`, `user_roles`, `tenant_memberships`
- CRM: `customers`, `accounts`, `contacts`, `subscriptions`, `support_tickets`, `complaints`
- Catalog: `products`, `product_plans`, `pricing_rules`, `promotions`, `bundles`
- Ordering: `orders`, `order_items`, `fulfillment_tasks`
- Billing: `usage_records`, `rating_rules`, `billing_cycles`, `invoices`, `payments`
- Network: `network_elements`, `network_interfaces`, `assets`, `locations`, `vendors`
- Service Ops: `services`, `service_instances`, `provisioning_tasks`, `work_orders`
- Assurance: `alarms`, `incidents`, `trouble_tickets`, `performance_metrics`
- Platform: `contracts`, `slas`, `workflows`, `event_logs`, `documents`, `notifications`, `audit_logs`

Current migration:
- `20260314103000_init_telecosync.sql`: core tenant model, RBAC, CRM, catalog, orders, billing, inventory, service ops, assurance, analytics, document, notification, audit, indexes, and RLS policies
