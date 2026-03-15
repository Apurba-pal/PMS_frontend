import { NextResponse } from "next/server";

export function middleware(request) {
  // `session` is a non-httpOnly cookie set on the frontend domain (pms.apurba.site)
  // after a successful login. The real `token` lives on the backend domain
  // (onrender.com) and is NOT accessible here.
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname === "/";

  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  const redirect = (path) =>
    NextResponse.redirect(new URL(path, request.url));

  // 1. Protected route without session → send to login
  if (isProtectedRoute && !session) {
    return redirect("/login");
  }

  // 2. Auth routes with session → already logged in, send to dashboard
  if (isAuthRoute && session) {
    return redirect("/dashboard");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
