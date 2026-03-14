import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@telecosync/api";
import { createCatalogProduct, getProductWorkspace } from "@telecosync/services";
import { getSessionUserFromRequest } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/data-mode";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { createProductSupabase, getProductWorkspaceSupabase } from "@/lib/supabase-data";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const sessionUser = getSessionUserFromRequest(request);
  if (!sessionUser) {
    return NextResponse.json({ code: "unauthorized", message: "Login required" }, { status: 401 });
  }
  const auth = authorize(
    {
      role: sessionUser.role,
      tenantId: sessionUser.tenantId
    },
    "products"
  );

  if (!auth.ok) {
    return NextResponse.json(auth.error, { status: 403 });
  }

  if (!DEMO_MODE) {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ code: "config_error", message: "Supabase configuration missing" }, { status: 500 });
    }
    const data = await getProductWorkspaceSupabase(
      supabase,
      url.searchParams.get("search") ?? "",
      url.searchParams.get("family") ?? ""
    );
    return NextResponse.json({
      resource: "products",
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  return NextResponse.json({
    resource: "products",
    timestamp: new Date().toISOString(),
    ...getProductWorkspace(url.searchParams.get("search") ?? "", url.searchParams.get("family") ?? "")
  });
}

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);
  if (!sessionUser) {
    return NextResponse.json({ code: "unauthorized", message: "Login required" }, { status: 401 });
  }
  const auth = authorize(
    {
      role: sessionUser.role,
      tenantId: sessionUser.tenantId
    },
    "products"
  );

  if (!auth.ok) {
    return NextResponse.json(auth.error, { status: 403 });
  }
  const payload = await request.json();

  if (!payload.name || !payload.family || payload.basePrice === undefined) {
    return NextResponse.json(
      { code: "validation_error", message: "name, family, and basePrice are required" },
      { status: 400 }
    );
  }

  if (!DEMO_MODE) {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ code: "config_error", message: "Supabase configuration missing" }, { status: 500 });
    }
    const result = await createProductSupabase(supabase, {
      name: payload.name,
      family: payload.family,
      version: payload.version ?? "v1.0",
      basePrice: Number(payload.basePrice),
      slaTarget: Number(payload.slaTarget ?? 99.9),
      downloadMbps: Number(payload.downloadMbps ?? 100),
      uploadMbps: Number(payload.uploadMbps ?? 50),
      dataLimitGb: Number(payload.dataLimitGb ?? 500)
    });
    return NextResponse.json({ message: "Product created", ...result }, { status: 201 });
  }

  const result = createCatalogProduct({
    tenantId: payload.tenantId ?? sessionUser.tenantId,
    name: payload.name,
    family: payload.family,
    version: payload.version ?? "v1.0",
    basePrice: Number(payload.basePrice),
    slaTarget: Number(payload.slaTarget ?? 99.9),
    downloadMbps: Number(payload.downloadMbps ?? 100),
    uploadMbps: Number(payload.uploadMbps ?? 50),
    dataLimitGb: Number(payload.dataLimitGb ?? 500)
  });

  return NextResponse.json(
    {
      message: "Product created",
      ...result
    },
    { status: 201 }
  );
}
