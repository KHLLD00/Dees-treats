"use server";

import { redirect } from "next/navigation";
import { clearAdminSession, getAdminSession, setAdminSession, supabaseConfig } from "@/lib/supabase-auth";

const adminRedirect = (message: string) => redirect("/admin?error=" + encodeURIComponent(message));
const successRedirect = (message: string) => redirect("/admin?saved=" + encodeURIComponent(message));

function cleanText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function validPrice(value: FormDataEntryValue | null) {
  const price = Number(value);
  return Number.isSafeInteger(price) && price >= 0 ? price : null;
}

function validTable(value: FormDataEntryValue | null): "cake_sizes" | "small_chops" | null {
  const table = String(value ?? "");
  return table === "cake_sizes" || table === "small_chops" ? table : null;
}

async function menuRequest(path: string, options: RequestInit = {}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const { url, key } = supabaseConfig();
  return fetch(url + "/rest/v1/" + path, {
    ...options,
    headers: {
      apikey: key,
      Authorization: "Bearer " + session.accessToken,
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function login(formData: FormData) {
  const email = cleanText(formData.get("email")).toLowerCase();
  const password = cleanText(formData.get("password"));
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
    redirect("/admin/login?error=Sign-in%20failed.%20Check%20your%20password.");
  }

  await setAdminSession(result.access_token, result.refresh_token, result.expires_in ?? 3600);
  redirect("/admin");
}

export async function logout() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveMenuItem(formData: FormData) {
  const table = validTable(formData.get("table"));
  const id = cleanText(formData.get("id"));
  const price = validPrice(formData.get("price"));
  const active = formData.get("active") === "on";

  if (!table || !id || price === null) adminRedirect("Please enter a valid price.");

  const payload: Record<string, unknown> = { price, active };

  if (table === "cake_sizes") {
    const label = cleanText(formData.get("label"));
    if (!label) adminRedirect("Cake name is required.");
    payload.label = label;
  } else {
    const name = cleanText(formData.get("name"));
    const detail = cleanText(formData.get("detail"));
    if (!name || !detail) adminRedirect("Small chops name and description are required.");
    payload.name = name;
    payload.detail = detail;
  }

  const response = await menuRequest(
    table + "?id=eq." + encodeURIComponent(id),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) adminRedirect("Could not save this menu item. Please try again.");
  successRedirect("Menu item saved successfully.");
}

export async function addMenuItem(formData: FormData) {
  const table = validTable(formData.get("table"));
  const price = validPrice(formData.get("price"));
  const active = formData.get("active") === "on";

  if (!table || price === null) adminRedirect("Please enter a valid menu item and price.");

  const payload: Record<string, unknown> = { price, active };

  if (table === "cake_sizes") {
    const label = cleanText(formData.get("label"));
    if (!label) adminRedirect("Cake name is required.");
    payload.id = crypto.randomUUID();
    payload.label = label;
  } else {
    const name = cleanText(formData.get("name"));
    const detail = cleanText(formData.get("detail"));
    if (!name || !detail) adminRedirect("Small chops name and description are required.");
    payload.id = crypto.randomUUID();
    payload.name = name;
    payload.detail = detail;
  }

  const orderResponse = await menuRequest(table + "?select=sort_order&order=sort_order.desc&limit=1");
  if (!orderResponse.ok) adminRedirect("Could not prepare the new menu item.");

  const rows = await orderResponse.json() as Array<{ sort_order: number }>;
  payload.sort_order = (rows[0]?.sort_order ?? -1) + 1;

  const response = await menuRequest(table, {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) adminRedirect("Could not add this menu item. Please try again.");
  successRedirect("New menu item added successfully.");
}

export async function deleteMenuItem(formData: FormData) {
  const table = validTable(formData.get("table"));
  const id = cleanText(formData.get("id"));

  const confirmed = formData.get("confirm_delete") === "on";
  if (!table || !id) adminRedirect("Invalid menu item.");
  if (!confirmed) adminRedirect("Please confirm before removing a menu item.");

  const response = await menuRequest(
    table + "?id=eq." + encodeURIComponent(id),
    { method: "DELETE", headers: { Prefer: "return=minimal" } },
  );

  if (!response.ok) adminRedirect("Could not remove this menu item. Please try again.");
  successRedirect("Menu item removed successfully.");
}
