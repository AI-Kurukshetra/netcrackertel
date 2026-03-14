import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { getUserById } from "@telecosync/database";

export const SESSION_COOKIE = "telecosync_session";

export function getSessionUserFromRequest(request: NextRequest) {
  const userId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  return getUserById(userId);
}

export function getSessionUserFromCookies() {
  const userId = cookies().get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  return getUserById(userId);
}
