import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN";
  exp: number;
}

function parseJwt(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr) as JWTPayload;
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  const payload = accessToken ? parseJwt(accessToken) : null;
  const isAuthenticated = Boolean(payload || refreshToken);

  // 1. ADMIN routes protection (/admin and /api/admin/*)
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (isAdminRoute) {
    if (!isAuthenticated) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin role
    if (payload && payload.role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/problems", req.url));
    }
  }

  // 2. Protected user routes (/profile, /settings, /submissions)
  const isUserProtectedRoute =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/submissions");

  if (isUserProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Guest-only routes (/login, /signup, /forgot-password)
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isAuthRoute && payload) {
    // Already logged in, redirect to problems
    return NextResponse.redirect(new URL("/problems", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/submissions/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
