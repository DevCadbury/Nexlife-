import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function validateToken(token: string): Promise<boolean> {
  try {
    // Decode JWT payload to check expiration
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }

    // Additional validation can be added here
    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const jwt = req.cookies.get("nxl_jwt")?.value;
  const isLogin = req.nextUrl.pathname.startsWith("/login");
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");

  // Allow API routes to handle their own authentication
  if (isApiRoute) {
    return NextResponse.next();
  }

  // If accessing admin routes
  if (isAdmin) {
    // No token at all - redirect to login
    if (!jwt) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Validate token
    const isValidToken = await validateToken(jwt);
    if (!isValidToken) {
      // Clear invalid token and redirect to login
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("nxl_jwt");
      return response;
    }
  }

  // If accessing login page while authenticated - redirect to admin
  if (isLogin && jwt) {
    const isValidToken = await validateToken(jwt);
    if (isValidToken) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    // Exclude API routes, static files, and Next.js internals
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"
  ]
};
