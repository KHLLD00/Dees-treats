"use server";

import { redirect } from "next/navigation";
import { clearAdminSession, getAdminSession, setAdminSession, supabaseConfig } from "@/lib/supabase-auth";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (email !== "sakinahaliyu5050@gmail.com" || !password) {
    redirect("/admin/login?error=Check%20your%20admin%20email%20and%20password.");
  }
  const { url, key } = supabaseConfig();
  const response = await fetch(url + "/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok || !result.access_token || !result.refresh_token) {
    redirect("/admin/login?error=Sign-in%20failed.%20Check%20your%20password%20or%20ask%20the%20site%20owner%20to%20invite%20your%20account.");
  }
  await setAdminSession(result.access_token, result.refresh_token, result.expires_in ?? 3600);
  redirect("/admin");
}

export async function logout() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveMenuItem(formData: FormData) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const table = String(formData.get("table") ?? "");
  const id = String(formData.get("id") ?? "");
  const price = Number(formData.get("price"));
  const active = formData.get("active") === "on";
  if (!["cake_sizes", "small_chops"].includes(table) || !id || !Number.isSafeInteger(price) || price < 0) {
    redirect("/admin?error=Please%20enter%20a%20valid%20price.");
  }
  const { url, key } = supabaseConfig();
  const response = await fetch(url + "/rest/v1/" + table + "?id=eq." + encodeURIComponent(id), {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: "Bearer " + session.accessToken,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ price, active }),
    cache: "no-store",
  });
  if (!response.ok) redirect("/admin?error=Could%20not%20save.%20Please%20try%20again.");
  redirect("/admin?saved=1");
}
