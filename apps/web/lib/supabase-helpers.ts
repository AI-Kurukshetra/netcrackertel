import type { SupabaseClient } from "@supabase/supabase-js";

export async function getOrCreateTenant(client: SupabaseClient) {
  const { data: tenants } = await client.from("tenants").select("*").limit(1);
  if (tenants && tenants.length > 0) {
    return tenants[0];
  }

  const { data, error } = await client
    .from("tenants")
    .insert({
      name: "TelecoSync Primary",
      code: "TELECOSYNC",
      region: "North America"
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getOrCreateService(client: SupabaseClient, tenantId: string) {
  const { data: services } = await client
    .from("services")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("category", "connectivity")
    .limit(1);
  if (services && services.length > 0) {
    return services[0];
  }

  const { data, error } = await client
    .from("services")
    .insert({
      tenant_id: tenantId,
      name: "Core Connectivity",
      category: "connectivity",
      status: "active"
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getOrCreateBillingCycle(client: SupabaseClient, tenantId: string) {
  const { data: cycles } = await client
    .from("billing_cycles")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("status", "open")
    .limit(1);
  if (cycles && cycles.length > 0) {
    return cycles[0];
  }

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
  const { data, error } = await client
    .from("billing_cycles")
    .insert({
      tenant_id: tenantId,
      name: `Cycle ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
      period_start: periodStart,
      period_end: periodEnd,
      status: "open"
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
