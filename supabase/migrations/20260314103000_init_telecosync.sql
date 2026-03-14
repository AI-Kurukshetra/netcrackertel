create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'tenant_id', '')::uuid
$$;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  region text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  resource text not null,
  action text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (resource, action)
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id),
  full_name text not null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, user_id, role_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  actor_id uuid references auth.users(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create or replace function public.has_platform_role(role_name text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    join public.roles r on r.id = tm.role_id
    where tm.user_id = auth.uid()
      and tm.tenant_id = public.current_tenant_id()
      and r.name = role_name
      and tm.deleted_at is null
  );
$$;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  segment text not null,
  lifecycle_stage text not null,
  monthly_revenue numeric(12,2) not null default 0,
  churn_risk numeric(5,2) not null default 0,
  support_tier text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  customer_id uuid not null references public.customers(id),
  status text not null,
  balance numeric(12,2) not null default 0,
  credit_class text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  customer_id uuid not null references public.customers(id),
  email text not null,
  phone text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  family text not null,
  version text not null,
  base_price numeric(12,2) not null,
  sla_target numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.product_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  product_id uuid not null references public.products(id),
  name text not null,
  download_mbps integer,
  upload_mbps integer,
  data_limit_gb integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  product_id uuid not null references public.products(id),
  rule_type text not null,
  expression text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  product_id uuid not null references public.products(id),
  name text not null,
  discount_percent numeric(5,2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.bundles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  price numeric(12,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.bundle_items (
  bundle_id uuid not null references public.bundles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  primary key (bundle_id, product_id)
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  category text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  customer_id uuid not null references public.customers(id),
  service_id uuid not null references public.services(id),
  product_id uuid not null references public.products(id),
  status text not null,
  monthly_charge numeric(12,2) not null,
  usage_gb numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  customer_id uuid not null references public.customers(id),
  status text not null,
  total numeric(12,2) not null,
  channel text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  order_id uuid not null references public.orders(id),
  product_id uuid not null references public.products(id),
  quantity integer not null default 1,
  fulfillment_state text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.fulfillment_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  order_id uuid not null references public.orders(id),
  name text not null,
  owner text,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.rating_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  metric text not null,
  unit_price numeric(12,4) not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.billing_cycles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  period_start date not null,
  period_end date not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.usage_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  subscription_id uuid not null references public.subscriptions(id),
  metric text not null,
  quantity numeric(12,2) not null,
  cost numeric(12,2) not null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  customer_id uuid not null references public.customers(id),
  cycle_id uuid not null references public.billing_cycles(id),
  total numeric(12,2) not null,
  tax numeric(12,2) not null,
  status text not null,
  due_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  invoice_id uuid not null references public.invoices(id),
  amount numeric(12,2) not null,
  method text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  category text not null,
  score numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  city text,
  country text,
  latitude numeric(10,6),
  longitude numeric(10,6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  vendor_id uuid references public.vendors(id),
  location_id uuid references public.locations(id),
  name text not null,
  asset_type text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.network_elements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  asset_id uuid references public.assets(id),
  location_id uuid references public.locations(id),
  hostname text not null,
  technology text not null,
  capacity_utilization numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.network_interfaces (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  network_element_id uuid not null references public.network_elements(id),
  name text not null,
  bandwidth_gbps numeric(8,2),
  utilization numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.service_instances (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  service_id uuid not null references public.services(id),
  subscription_id uuid not null references public.subscriptions(id),
  status text not null,
  uptime numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.provisioning_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  service_instance_id uuid not null references public.service_instances(id),
  task_type text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  service_instance_id uuid not null references public.service_instances(id),
  description text not null,
  status text not null,
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.alarms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  network_element_id uuid not null references public.network_elements(id),
  severity text not null,
  summary text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  alarm_id uuid not null references public.alarms(id),
  summary text not null,
  priority text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.trouble_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  customer_id uuid not null references public.customers(id),
  incident_id uuid references public.incidents(id),
  summary text not null,
  priority text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  customer_id uuid not null references public.customers(id),
  name text not null,
  value numeric(12,2) not null,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.slas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  contract_id uuid not null references public.contracts(id),
  name text not null,
  uptime_target numeric(5,2) not null,
  latency_target_ms integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.performance_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  network_element_id uuid not null references public.network_elements(id),
  metric text not null,
  value numeric(12,2) not null,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  trigger text not null,
  status text not null,
  success_rate numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.event_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  actor text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  bucket text not null,
  storage_path text not null,
  document_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  channel text not null,
  title text not null,
  category text not null,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_customers_tenant on public.customers (tenant_id, lifecycle_stage) where deleted_at is null;
create index if not exists idx_products_tenant on public.products (tenant_id, family) where deleted_at is null;
create index if not exists idx_orders_tenant on public.orders (tenant_id, status, created_at desc) where deleted_at is null;
create index if not exists idx_invoices_tenant on public.invoices (tenant_id, status, due_date) where deleted_at is null;
create index if not exists idx_usage_subscription on public.usage_records (subscription_id, occurred_at desc) where deleted_at is null;
create index if not exists idx_assets_tenant on public.assets (tenant_id, asset_type, status) where deleted_at is null;
create index if not exists idx_network_elements_tenant on public.network_elements (tenant_id, technology) where deleted_at is null;
create index if not exists idx_alarms_tenant on public.alarms (tenant_id, severity, status) where deleted_at is null;
create index if not exists idx_metrics_tenant on public.performance_metrics (tenant_id, metric, recorded_at desc) where deleted_at is null;
create index if not exists idx_event_logs_tenant on public.event_logs (tenant_id, created_at desc) where deleted_at is null;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'user_profiles','tenant_memberships','audit_logs','customers','accounts','contacts',
    'products','product_plans','pricing_rules','promotions','bundles','services',
    'subscriptions','orders','order_items','fulfillment_tasks','rating_rules','billing_cycles',
    'usage_records','invoices','payments','vendors','locations','assets','network_elements',
    'network_interfaces','service_instances','provisioning_tasks','work_orders','alarms',
    'incidents','trouble_tickets','contracts','slas','performance_metrics','workflows',
    'event_logs','documents','notifications'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy %I_tenant_isolation_select on public.%I for select using (tenant_id = public.current_tenant_id() and deleted_at is null)',
      table_name, table_name
    );
    execute format(
      'create policy %I_tenant_isolation_mutate on public.%I for all using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id())',
      table_name, table_name
    );
  end loop;
end $$;

create policy tenants_membership_select on public.tenants
for select
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.user_id = auth.uid() and tm.tenant_id = id
));

create trigger set_updated_at_customers before update on public.customers for each row execute procedure public.set_updated_at();
create trigger set_updated_at_accounts before update on public.accounts for each row execute procedure public.set_updated_at();
create trigger set_updated_at_products before update on public.products for each row execute procedure public.set_updated_at();
create trigger set_updated_at_orders before update on public.orders for each row execute procedure public.set_updated_at();
create trigger set_updated_at_invoices before update on public.invoices for each row execute procedure public.set_updated_at();
create trigger set_updated_at_assets before update on public.assets for each row execute procedure public.set_updated_at();
create trigger set_updated_at_network_elements before update on public.network_elements for each row execute procedure public.set_updated_at();
create trigger set_updated_at_alarms before update on public.alarms for each row execute procedure public.set_updated_at();
