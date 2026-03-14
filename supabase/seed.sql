insert into public.roles (name, description)
values
  ('Admin', 'Platform-wide administration'),
  ('Network Engineer', 'Network operations and performance'),
  ('Support Agent', 'Customer support workflows'),
  ('Billing Manager', 'Billing and revenue oversight'),
  ('Product Manager', 'Catalog and commercial strategy'),
  ('Field Technician', 'Work orders and provisioning')
on conflict (name) do nothing;

insert into public.permissions (resource, action)
values
  ('customers', 'read'),
  ('customers', 'write'),
  ('products', 'write'),
  ('orders', 'write'),
  ('billing', 'approve'),
  ('inventory', 'read'),
  ('network', 'manage'),
  ('faults', 'manage'),
  ('analytics', 'read'),
  ('admin', 'manage')
on conflict (resource, action) do nothing;
