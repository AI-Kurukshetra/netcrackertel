import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@telecosync/api";
import { getCustomerWorkspace, onboardCustomer } from "@telecosync/services";
import { getSessionUserFromRequest } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/data-mode";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { createCustomerOnboardingSupabase, getCustomerWorkspaceSupabase } from "@/lib/supabase-data";

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
    "customers"
  );

  if (!auth.ok) {
    return NextResponse.json(auth.error, { status: 403 });
  }

  if (!DEMO_MODE) {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ code: "config_error", message: "Supabase configuration missing" }, { status: 500 });
    }
    const data = await getCustomerWorkspaceSupabase(supabase, url.searchParams.get("search") ?? "");
    return NextResponse.json({
      resource: "customers",
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  return NextResponse.json({
    resource: "customers",
    timestamp: new Date().toISOString(),
    ...getCustomerWorkspace(url.searchParams.get("search") ?? "")
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
    "customers"
  );

  if (!auth.ok) {
    return NextResponse.json(auth.error, { status: 403 });
  }
  const payload = await request.json();

  if (!payload.name || !payload.email || !payload.phone || !payload.city || !payload.productId) {
    return NextResponse.json(
      { code: "validation_error", message: "name, email, phone, city, and productId are required" },
      { status: 400 }
    );
  }

  if (!DEMO_MODE) {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ code: "config_error", message: "Supabase configuration missing" }, { status: 500 });
    }

    const result = await createCustomerOnboardingSupabase(supabase, {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      city: payload.city,
      segment: payload.segment ?? "business",
      supportTier: payload.supportTier ?? "priority",
      productId: payload.productId
    });

    return NextResponse.json(
      {
        message: "Customer onboarded",
        ...result
      },
      { status: 201 }
    );
  }

  const result = onboardCustomer({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    city: payload.city,
    segment: payload.segment ?? "business",
    supportTier: payload.supportTier ?? "priority",
    productId: payload.productId,
    tenantId: payload.tenantId ?? sessionUser.tenantId
  });

  return NextResponse.json(
    {
      message: "Customer onboarded",
      ...result
    },
    { status: 201 }
  );
}
