import { redirect } from "next/navigation";

export const instant = false;
import { logout, saveMenuItem } from "./actions";
import { getAdminSession, supabaseConfig } from "@/lib/supabase-auth";

type CakeRow = { id: string; label: string; price: number; active: boolean; sort_order: number };
type ChopRow = { id: string; name: string; detail: string; price: number; active: boolean; sort_order: number };

async function getRows<T>(table: string, token: string): Promise<T[]> {
  const { url, key } = supabaseConfig();
  const response = await fetch(url + "/rest/v1/" + table + "?select=*&order=sort_order.asc", {
    headers: { apikey: key, Authorization: "Bearer " + token },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load the menu. Please refresh.");
  return response.json();
}

function MenuEditor({ table, id, name, detail, price, active }: {
  table: "cake_sizes" | "small_chops"; id: string; name: string; detail?: string;
  price: number; active: boolean;
}) {
  return (
    <form action={saveMenuItem} className="grid gap-3 rounded-xl border border-plum/15 bg-white p-4 sm:grid-cols-[1fr_130px_auto] sm:items-center">
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <div><p className="font-semibold">{name}</p>{detail && <p className="text-sm text-plum/70">{detail}</p>}</div>
      <label className="block"><span className="mb-1 block text-xs font-semibold">Price (₦)</span>
        <input name="price" type="number" min="0" step="1" required defaultValue={price} className="w-full rounded-lg border-2 border-plum/25 px-3 py-2" />
      </label>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <label className="flex items-center gap-2 text-sm font-semibold"><input name="active" type="checkbox" defaultChecked={active} className="size-4 accent-cherry" />Available</label>
        <button type="submit" className="rounded-full bg-cherry px-4 py-2 text-sm font-semibold text-white hover:bg-cherry-deep">Save</button>
      </div>
    </form>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const [{ saved, error }, cakes, chops] = await Promise.all([
    searchParams,
    getRows<CakeRow>("cake_sizes", session.accessToken),
    getRows<ChopRow>("small_chops", session.accessToken),
  ]);
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-widest text-cherry">Dee&apos;s Treats</p>
          <h1 className="mt-1 font-display text-4xl font-black">Menu dashboard</h1><p className="mt-2">Signed in as {session.email}</p></div>
        <form action={logout}><button className="rounded-full border-2 border-plum px-5 py-2 font-semibold">Sign out</button></form>
      </div>
      {saved && <p role="status" className="mt-6 rounded-lg bg-green-50 px-4 py-3 font-semibold text-green-800">Menu item saved successfully.</p>}
      {error && <p role="alert" className="mt-6 rounded-lg bg-frosting-soft px-4 py-3 font-semibold">{error}</p>}
      <section className="mt-10"><h2 className="mb-4 font-display text-2xl font-bold">Cake sizes</h2>
        <div className="space-y-3">{cakes.map(item => <MenuEditor key={item.id} table="cake_sizes" id={item.id} name={item.label + " cake"} price={item.price} active={item.active} />)}</div>
      </section>
      <section className="mt-10"><h2 className="mb-4 font-display text-2xl font-bold">Small chops</h2>
        <div className="space-y-3">{chops.map(item => <MenuEditor key={item.id} table="small_chops" id={item.id} name={item.name} detail={item.detail} price={item.price} active={item.active} />)}</div>
      </section>
      <p className="mt-8 text-sm text-plum/70">Changes appear on the public menu after saving. Inactive items are hidden from customers.</p>
    </main>
  );
}
