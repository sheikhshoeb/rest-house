/**
 * apps/web/src/lib/auth.js
 * Small client-side token helper (optional).
 * Prefer server-set HttpOnly cookie for security instead of client tokens.
 */
const COOKIE_NAME = "rest_house_token";

export function setTokenCookie(token, { days = 7 } = {}) {
  if (typeof window === "undefined") return;
  if (!token) {
    clearTokenCookie();
    return;
  }
  const maxAge = days * 24 * 60 * 60; // seconds
}

export function getTokenCookie() {
  if (typeof window === "undefined") return null;
  try {
    const t = localStorage.getItem("rest_house_token");
    if (t) return t;
  } catch (e) {}
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + COOKIE_NAME + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearTokenCookie() {
  if (typeof window === "undefined") return;
}
