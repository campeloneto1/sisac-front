import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "sisac_session";

export function proxy(request: NextRequest) {
  const isAuthenticated = request.cookies.get(AUTH_COOKIE)?.value === "authenticated";
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/users") || pathname.startsWith("/profile");

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/users/:path*", "/profile/:path*"],
};
