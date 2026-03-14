import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@telecosync/api";
import { getDocumentDetail } from "@telecosync/services";
import { getSessionUserFromRequest } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/data-mode";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getDocumentDetailSupabase } from "@/lib/supabase-data";

export async function GET(request: NextRequest, { params }: { params: { documentId: string } }) {
  const sessionUser = getSessionUserFromRequest(request);
  if (!sessionUser) {
    return NextResponse.json({ code: "unauthorized", message: "Login required" }, { status: 401 });
  }

  const auth = authorize({ role: sessionUser.role, tenantId: sessionUser.tenantId }, "documents");
  if (!auth.ok) {
    return NextResponse.json(auth.error, { status: 403 });
  }

  if (!DEMO_MODE) {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ code: "config_error", message: "Supabase configuration missing" }, { status: 500 });
    }
    const document = await getDocumentDetailSupabase(supabase, params.documentId);
    if (!document) {
      return NextResponse.json({ code: "not_found", message: "Document not found" }, { status: 404 });
    }
    return NextResponse.json({
      resource: "documents",
      timestamp: new Date().toISOString(),
      document
    });
  }

  const document = getDocumentDetail(params.documentId);
  if (!document) {
    return NextResponse.json({ code: "not_found", message: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({
    resource: "documents",
    timestamp: new Date().toISOString(),
    document
  });
}
