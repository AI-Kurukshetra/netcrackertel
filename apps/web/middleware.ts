import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/customers",
  "/products",
  "/orders",
  "/billing",
  "/inventory",
  "/services",
  "/faults",
  "/performance",
  "/workflows",
  "/analytics",
  "/admin",
  "/notifications",
  "/documents"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = request.cookies.get("telecosync_session")?.value;
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/customers/:path*", "/products/:path*", "/orders/:path*", "/billing/:path*", "/inventory/:path*", "/services/:path*", "/faults/:path*", "/performance/:path*", "/workflows/:path*", "/analytics/:path*", "/admin/:path*", "/notifications/:path*", "/documents/:path*"]
};
