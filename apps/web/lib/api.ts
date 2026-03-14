import { NextRequest, NextResponse } from "next/server";
import { buildApiResponse } from "@telecosync/api";
import { getSessionUserFromRequest } from "@/lib/auth";

export function apiHandler(resource: string) {
  return function handler(request: NextRequest) {
    const url = new URL(request.url);
    const sessionUser = getSessionUserFromRequest(request);
    const headerRole = request.headers.get("x-role");

    if (!sessionUser && !headerRole) {
      return NextResponse.json(
        {
          code: "unauthorized",
          message: "Login required"
        },
        { status: 401 }
      );
    }

    const response = buildApiResponse(
      resource,
      {
        role: sessionUser?.role ?? headerRole ?? "Admin",
        tenantId: sessionUser?.tenantId ?? request.headers.get("x-tenant-id") ?? "tenant_0001"
      },
      {
        page: Number(url.searchParams.get("page") ?? "1"),
        pageSize: Number(url.searchParams.get("pageSize") ?? "10"),
        search: url.searchParams.get("search") ?? ""
      }
    );

    return NextResponse.json(
      {
        resource,
        timestamp: new Date().toISOString(),
        ...response.body
      },
      { status: response.status }
    );
  };
}
