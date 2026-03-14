import { NextRequest, NextResponse } from "next/server";
import { createUser, getSafeUsers } from "@telecosync/database";
import { getSessionUserFromRequest } from "@/lib/auth";

export function GET(request: NextRequest) {
  const user = getSessionUserFromRequest(request);
  if (!user || user.role !== "Admin") {
    return NextResponse.json({ code: "forbidden", message: "Admin access required" }, { status: 403 });
  }

  return NextResponse.json({
    users: getSafeUsers()
  });
}

export async function POST(request: NextRequest) {
  const admin = getSessionUserFromRequest(request);
  if (!admin || admin.role !== "Admin") {
    return NextResponse.json({ code: "forbidden", message: "Admin access required" }, { status: 403 });
  }

  const payload = await request.json();
  if (!payload.email || !payload.password || !payload.name || !payload.role || !payload.title) {
    return NextResponse.json({ code: "validation_error", message: "name, email, password, role, and title are required" }, { status: 400 });
  }

  try {
    const user = createUser({
      tenantId: payload.tenantId,
      email: payload.email,
      password: payload.password,
      name: payload.name,
      role: payload.role,
      title: payload.title
    });

    return NextResponse.json({ message: "User created", user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { code: "create_failed", message: error instanceof Error ? error.message : "Unable to create user" },
      { status: 400 }
    );
  }
}
