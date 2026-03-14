import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@telecosync/api";
import { generateAnalyticsInsights, getAnalyticsWorkspace } from "@telecosync/services";
import { getSessionUserFromRequest } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/data-mode";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getAnalyticsWorkspaceSupabase } from "@/lib/supabase-data";

export async function GET(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);
  if (!sessionUser) {
    return NextResponse.json({ code: "unauthorized", message: "Login required" }, { status: 401 });
  }

  const auth = authorize({ role: sessionUser.role, tenantId: sessionUser.tenantId }, "analytics");
  if (!auth.ok) {
    return NextResponse.json(auth.error, { status: 403 });
  }

  if (!DEMO_MODE) {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ code: "config_error", message: "Supabase configuration missing" }, { status: 500 });
    }
    const data = await getAnalyticsWorkspaceSupabase(supabase);
    return NextResponse.json({
      resource: "analytics",
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  return NextResponse.json({
    resource: "analytics",
    timestamp: new Date().toISOString(),
    ...getAnalyticsWorkspace()
  });
}

export function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);
  if (!sessionUser) {
    return NextResponse.json({ code: "unauthorized", message: "Login required" }, { status: 401 });
  }

  const auth = authorize({ role: sessionUser.role, tenantId: sessionUser.tenantId }, "analytics");
  if (!auth.ok) {
    return NextResponse.json(auth.error, { status: 403 });
  }

  return NextResponse.json({
    message: "Analytics insights generated",
    ...generateAnalyticsInsights()
  });
}
