import { cookies } from "next/headers";

const ACCESS_COOKIE = "dees_admin_access";
const REFRESH_COOKIE = "dees_admin_refresh";
const ADMIN_EMAIL = "sakinahaliyu5050@gmail.com";

export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing.");
  return { url: url.replace(/\/$/, ""), key };
}

export async function getAdminSession() {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  if (!accessToken) return null;
  const { url, key } = supabaseConfig();
  const response = await fetch(url + "/auth/v1/user", {
    headers: { apikey: key, Authorization: "Bearer " + accessToken },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const user = await response.json() as { email?: string };
  if (user.email?.toLowerCase() !== ADMIN_EMAIL) return null;
  return { accessToken, email: user.email };
}

export async function setAdminSession(accessToken: string, refreshToken: string, expiresIn: number) {
  const store = await cookies();
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
  store.set(ACCESS_COOKIE, accessToken, { ...options, maxAge: expiresIn });
  store.set(REFRESH_COOKIE, refreshToken, { ...options, maxAge: 60 * 60 * 24 * 30 });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export const adminEmail = ADMIN_EMAIL;
