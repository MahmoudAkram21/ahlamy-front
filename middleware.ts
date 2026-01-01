/**
 * Middleware for Authentication and Route Protection
 *
 * This middleware handles:
 * - Basic authentication check (token exists)
 * - Protected routes (admin, dashboard, etc.)
 * - Public routes (landing page, auth pages)
 *
 * Note: Full JWT verification is done in API routes, not in middleware
 * (Edge Runtime doesn't support Node.js crypto module needed for JWT)
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookie (just check existence, don't verify)
  const token = request.cookies.get("auth_token")?.value;
  const isAuthenticated = !!token;

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/dreams", "/admin", "/interpreter"];

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect to login if trying to access protected route without token
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
