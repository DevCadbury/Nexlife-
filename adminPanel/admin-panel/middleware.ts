import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const jwt = req.cookies.get("nxl_jwt")?.value;
  const isLogin = req.nextUrl.pathname.startsWith("/login");
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");
  if (!jwt && isAdmin) return NextResponse.redirect(new URL("/login", req.url));
  if (jwt && isLogin) return NextResponse.redirect(new URL("/admin", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/login"] };
