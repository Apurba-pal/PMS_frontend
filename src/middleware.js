import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // Helper to redirect
  const redirect = (path) => {
    return NextResponse.redirect(new URL(path, request.url));
  };

  // 1. If trying to access protected route without token -> Redirect to login
  if (isProtectedRoute && !token) {
    return redirect("/login");
  }

  // 2. If trying to access auth routes (login/signup) WITH token -> Redirect to dashboard
  if (isAuthRoute && token) {
    return redirect("/dashboard");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/login", 
    "/signup"
  ],
};
