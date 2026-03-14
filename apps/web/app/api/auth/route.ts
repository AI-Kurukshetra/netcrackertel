import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@telecosync/database";
import { SESSION_COOKIE, getSessionUserFromRequest } from "@/lib/auth";

export function GET(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request);
  return NextResponse.json({
    mode: "demo",
    sessionUser
  });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const user = authenticateUser(payload.email ?? "", payload.password ?? "");

  if (!user) {
    return NextResponse.json({ code: "invalid_credentials", message: "Invalid email or password" }, { status: 401 });
  }

  const response = NextResponse.json({
    message: "Logged in",
    user
  });

  response.cookies.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });

  return response;
}
