// apps/admin/middleware.js
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

async function isAuthenticated(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";

    const res = await fetch(`${API_BASE}/api/admin-auth/me`, {
      method: "GET",
      headers: { cookie: cookieHeader },
    });

    return res.ok;
  } catch (err) {
    console.error("Auth check failed in middleware:", err);
    return false;
  }
}

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Allow static/internal assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Public pages
  const publicPaths = ["/login", "/register", "/", "/auth"];
  if (publicPaths.includes(pathname) || publicPaths.some((p) => pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Protect ALL main admin routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/main")) {
    const ok = await isAuthenticated(req);
    if (!ok) {
      // ❌ REMOVE next=<path> — always redirect clean
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// Middleware applies only to these URLs
export const config = {
  matcher: ["/dashboard/:path*", "/dashboard", "/main/:path*", "/main"],
};
