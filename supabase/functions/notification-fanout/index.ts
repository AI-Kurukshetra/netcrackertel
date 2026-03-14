import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (request) => {
  const payload = await request.json().catch(() => ({}));

  return new Response(
    JSON.stringify({
      ok: true,
      function: "notification-fanout",
      notificationType: payload.category ?? "billing",
      channels: ["email", "sms", "in_app"],
      dispatchedAt: new Date().toISOString()
    }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
});
