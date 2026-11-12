import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = "sakinahaliyu5050@gmail.com";
const ACCESS_COOKIE = "dees_admin_access";
const REFRESH_COOKIE = "dees_admin_refresh";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!accessToken) return clearAndRedirect(request);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return clearAndRedirect(request);

  let token = accessToken;
  let userResponse = await fetch(url + "/auth/v1/user", {
    headers: { apikey: key, Authorization: "Bearer " + token }, cache: "no-store",
  });
  let refreshed: { access_token?: string; refresh_token?: string; expires_in?: number } | null = null;
  if (!userResponse.ok && refreshToken) {
    const refreshResponse = await fetch(url + "/auth/v1/token?grant_type=refresh_token", {
      method: "POST", headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }), cache: "no-store",
    });
    if (refreshResponse.ok) {
      refreshed = await refreshResponse.json();
      if (refreshed.access_token) {
        token = refreshed.access_token;
        userResponse = await fetch(url + "/auth/v1/user", {
          headers: { apikey: key, Authorization: "Bearer " + token }, cache: "no-store",
        });
      }
    }
  }
  if (!userResponse.ok) return clearAndRedirect(request);
  const user = await userResponse.json() as { email?: string };
  if (user.email?.toLowerCase() !== ADMIN_EMAIL) return clearAndRedirect(request);

  if (refreshed?.access_token && refreshed.refresh_token) {
    request.cookies.set(ACCESS_COOKIE, refreshed.access_token);
    request.cookies.set(REFRESH_COOKIE, refreshed.refresh_token);
  }
  const response = NextResponse.next({ request });
  if (refreshed?.access_token && refreshed.refresh_token) {
    const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
    response.cookies.set(ACCESS_COOKIE, refreshed.access_token, { ...options, maxAge: refreshed.expires_in ?? 3600 });
    response.cookies.set(REFRESH_COOKIE, refreshed.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 30 });
  }
  return response;
}

function clearAndRedirect(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
