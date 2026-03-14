import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@telecosync/api";
import { createWorkflow, runWorkflow, setWorkflowStatus } from "@telecosync/database";
import { getSessionUserFromRequest } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { DEMO_MODE } from "@/lib/data-mode";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { createWorkflowSupabase, getWorkflowsSupabase, runWorkflowSupabase, toggleWorkflowSupabase } from "@/lib/supabase-data";

export async function GET(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);
  if (!sessionUser) {
    return NextResponse.json({ code: "unauthorized", message: "Login required" }, { status: 401 });
  }

  const auth = authorize({ role: sessionUser.role, tenantId: sessionUser.tenantId }, "workflows");
  if (!auth.ok) {
    return NextResponse.json(auth.error, { status: 403 });
  }

  if (!DEMO_MODE) {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ code: "config_error", message: "Supabase configuration missing" }, { status: 500 });
    }
    const data = await getWorkflowsSupabase(supabase);
    return NextResponse.json({
      resource: "workflows",
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  return apiHandler("workflows")(request);
}

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);
  if (!sessionUser) {
    return NextResponse.json({ code: "unauthorized", message: "Login required" }, { status: 401 });
  }

  const auth = authorize({ role: sessionUser.role, tenantId: sessionUser.tenantId }, "workflows");
  if (!auth.ok) {
    return NextResponse.json(auth.error, { status: 403 });
  }

  const payload = await request.json();

  try {
    if (payload.action === "create") {
      if (!payload.name || !payload.trigger) {
        return NextResponse.json({ code: "validation_error", message: "name and trigger are required" }, { status: 400 });
      }
      if (!DEMO_MODE) {
        const supabase = getSupabaseServerClient();
        if (!supabase) {
          return NextResponse.json({ code: "config_error", message: "Supabase configuration missing" }, { status: 500 });
        }
        const workflow = await createWorkflowSupabase(supabase, payload.name, payload.trigger);
        return NextResponse.json({ message: "Workflow created", workflow }, { status: 201 });
      }
      const workflow = createWorkflow({
        tenantId: sessionUser.tenantId,
        name: payload.name,
        trigger: payload.trigger
      });
      return NextResponse.json({ message: "Workflow created", workflow }, { status: 201 });
    }

    if (payload.action === "toggle") {
      if (!payload.workflowId || !payload.status) {
        return NextResponse.json({ code: "validation_error", message: "workflowId and status are required" }, { status: 400 });
      }
      if (!DEMO_MODE) {
        const supabase = getSupabaseServerClient();
        if (!supabase) {
          return NextResponse.json({ code: "config_error", message: "Supabase configuration missing" }, { status: 500 });
        }
        const workflow = await toggleWorkflowSupabase(supabase, payload.workflowId, payload.status);
        return NextResponse.json({ message: `Workflow ${payload.status === "active" ? "resumed" : "paused"}`, workflow });
      }
      const workflow = setWorkflowStatus(payload.workflowId, payload.status);
      return NextResponse.json({ message: `Workflow ${payload.status === "active" ? "resumed" : "paused"}`, workflow });
    }

    if (payload.action === "run") {
      if (!payload.workflowId) {
        return NextResponse.json({ code: "validation_error", message: "workflowId is required" }, { status: 400 });
      }
      if (!DEMO_MODE) {
        const supabase = getSupabaseServerClient();
        if (!supabase) {
          return NextResponse.json({ code: "config_error", message: "Supabase configuration missing" }, { status: 500 });
        }
        const workflow = await runWorkflowSupabase(supabase, payload.workflowId);
        return NextResponse.json({ message: "Workflow executed", workflow, executedAt: new Date().toISOString() });
      }
      const result = runWorkflow(payload.workflowId);
      return NextResponse.json({ message: "Workflow executed", ...result });
    }

    return NextResponse.json({ code: "validation_error", message: "Unsupported workflow action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { code: "workflow_error", message: error instanceof Error ? error.message : "Workflow action failed" },
      { status: 400 }
    );
  }
}
