import {
  CAKE_SIZES,
  SMALL_CHOPS,
  type CakeSize,
  type MenuData,
  type SmallChop,
} from "./menu";

const fallbackMenu: MenuData = {
  cakeSizes: CAKE_SIZES,
  smallChops: SMALL_CHOPS,
};

function isCakeRows(rows: unknown): rows is CakeSize[] {
  return Array.isArray(rows) && rows.length > 0 && rows.every((row: unknown) => {
    if (!row || typeof row !== "object") return false;
    const item = row as Record<string, unknown>;
    return typeof item.id === "string" && typeof item.label === "string" && typeof item.price === "number";
  });
}

function isSmallChopsRows(rows: unknown): rows is SmallChop[] {
  return Array.isArray(rows) && rows.length > 0 && rows.every((row: unknown) => {
    if (!row || typeof row !== "object") return false;
    const item = row as Record<string, unknown>;
    return (
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.detail === "string" &&
      typeof item.price === "number"
    );
  });
}

export async function fetchMenuData(): Promise<MenuData> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return fallbackMenu;

  const headers = { apikey: key };

  try {
    const [cakesResponse, chopsResponse] = await Promise.all([
      fetch(`${url}/rest/v1/cake_sizes?select=id,label,price&active=eq.true&order=sort_order.asc`, {
        headers,
        cache: "no-store",
      }),
      fetch(`${url}/rest/v1/small_chops?select=id,name,detail,price&active=eq.true&order=sort_order.asc`, {
        headers,
        cache: "no-store",
      }),
    ]);

    if (!cakesResponse.ok || !chopsResponse.ok) return fallbackMenu;

    const [cakeSizes, smallChops] = await Promise.all([
      cakesResponse.json(),
      chopsResponse.json(),
    ]);

    if (!isCakeRows(cakeSizes) || !isSmallChopsRows(smallChops)) return fallbackMenu;

    return { cakeSizes, smallChops };
  } catch {
    return fallbackMenu;
  }
}
