import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = req.cookies.get("rest_house_token")?.value;

  // Routes that require login
  const protectedRoutes = ["/dashboard", "/profile", "/booking"];

  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  const requiresAuth = protectedRoutes.some((r) => pathname.startsWith(r));

  if (requiresAuth && !token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/booking/:path*"],
};
