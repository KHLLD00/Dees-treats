import { CAKE_SIZES, SMALL_CHOPS, type MenuData } from "./menu";

const fallbackMenu: MenuData = {
  cakeSizes: CAKE_SIZES,
  smallChops: SMALL_CHOPS,
};

function isValidRows<T extends { id: string; price: number }>(rows: unknown): rows is T[] {
  return Array.isArray(rows) && rows.length > 0 && rows.every(
    (row) => row && typeof row.id === "string" && typeof row.price === "number",
  );
}

export async function fetchMenuData(): Promise<MenuData> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return fallbackMenu;

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };

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

    if (!isValidRows(cakeSizes) || !cakeSizes.every((item) => typeof item.label === "string")) {
      return fallbackMenu;
    }
    if (!isValidRows(smallChops) || !smallChops.every(
      (item) => typeof item.name === "string" && typeof item.detail === "string",
    )) {
      return fallbackMenu;
    }

    return { cakeSizes, smallChops };
  } catch {
    return fallbackMenu;
  }
}
