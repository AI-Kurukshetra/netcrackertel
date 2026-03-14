import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@telecosync/api";
import { apiHandler } from "@/lib/api";
import { getSessionUserFromRequest } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/data-mode";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getServicesSupabase } from "@/lib/supabase-data";

export async function GET(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);
  if (!sessionUser) {
    return NextResponse.json({ code: "unauthorized", message: "Login required" }, { status: 401 });
  }
  const auth = authorize({ role: sessionUser.role, tenantId: sessionUser.tenantId }, "services");
  if (!auth.ok) {
    return NextResponse.json(auth.error, { status: 403 });
  }

  const url = new URL(request.url);
  if (!DEMO_MODE) {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ code: "config_error", message: "Supabase configuration missing" }, { status: 500 });
    }
    const data = await getServicesSupabase(supabase, url.searchParams.get("search") ?? "");
    return NextResponse.json({
      resource: "services",
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  return apiHandler("services")(request);
}
