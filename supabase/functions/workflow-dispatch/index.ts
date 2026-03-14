import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (request) => {
  const payload = await request.json().catch(() => ({}));

  return new Response(
    JSON.stringify({
      ok: true,
      function: "workflow-dispatch",
      receivedAt: new Date().toISOString(),
      workflow: payload.workflow ?? "customer.onboarding",
      status: "queued"
    }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
});
