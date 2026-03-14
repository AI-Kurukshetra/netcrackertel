import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}
