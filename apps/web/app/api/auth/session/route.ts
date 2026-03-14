import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";

export function GET(request: NextRequest) {
  const user = getSessionUserFromRequest(request);
  return NextResponse.json({ user });
}
