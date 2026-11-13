import { redirect } from "next/navigation";

export const instant = false;

import { addMenuItem, deleteMenuItem, logout, saveMenuItem } from "./actions";
import { getAdminSession, supabaseConfig } from "@/lib/supabase-auth";

type CakeRow = { id: string; label: string; price: number; active: boolean; sort_order: number };
type ChopRow = { id: string; name: string; detail: string; price: number; active: boolean; sort_order: number };

async function getRows<T>(table: string, token: string): Promise<T[]> {
  const { url, key } = supabaseConfig();
  const response = await fetch(url + "/rest/v1/" + table + "?select=*&order=sort_order.asc", {
    headers: { apikey: key, Authorization: "Bearer " + token },
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Could not load the menu.");
  return response.json();
}

function MenuEditor({
  table, id, label, name, detail, price, active,
}: {
  table: "cake_sizes" | "small_chops";
  id: string;
  label?: string;
  name?: string;
  detail?: string;
  price: number;
  active: boolean;
}) {
  return (
    <div className="rounded-xl border border-plum/15 bg-white p-4">
      <form action={saveMenuItem} className="grid gap-3">
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="id" value={id} />

        {table === "cake_sizes" ? (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">Cake name / size</span>
            <input name="label" required defaultValue={label} className="w-full rounded-lg border-2 border-plum/25 px-3 py-2" />
          </label>
        ) : (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">Name</span>
              <input name="name" required defaultValue={name} className="w-full rounded-lg border-2 border-plum/25 px-3 py-2" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">Description</span>
              <input name="detail" required defaultValue={detail} className="w-full rounded-lg border-2 border-plum/25 px-3 py-2" />
            </label>
          </>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="block w-36">
            <span className="mb-1 block text-xs font-semibold">Price (₦)</span>
            <input name="price" type="number" min="0" step="1" required defaultValue={price} className="w-full rounded-lg border-2 border-plum/25 px-3 py-2" />
          </label>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input name="active" type="checkbox" defaultChecked={active} className="size-4 accent-cherry" />
              Available
            </label>
            <button type="submit" className="rounded-full bg-cherry px-4 py-2 text-sm font-semibold text-white hover:bg-cherry-deep">
              Save changes
            </button>
          </div>
        </div>
      </form>

      <form action={deleteMenuItem} className="mt-3 flex flex-wrap items-center gap-3">
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="id" value={id} />
        <label className="flex items-center gap-2 text-sm">
          <input name="confirm_delete" type="checkbox" className="size-4" />
          Confirm permanent removal
        </label>
        <button type="submit" className="text-sm font-semibold text-red-700 underline underline-offset-4">
          Remove item
        </button>
      </form>
    </div>
  );
}

function AddMenuForm({ table }: { table: "cake_sizes" | "small_chops" }) {
  return (
    <form action={addMenuItem} className="rounded-xl border-2 border-dashed border-plum/25 bg-white/70 p-5">
      <input type="hidden" name="table" value={table} />
      <h3 className="font-display text-lg font-bold">Add new {table === "cake_sizes" ? "cake" : "small chops item"}</h3>

      <div className="mt-4 grid gap-3">
        {table === "cake_sizes" ? (
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Cake name / size</span>
            <input name="label" required placeholder="e.g. 10 inch" className="w-full rounded-lg border-2 border-plum/25 px-3 py-2" />
          </label>
        ) : (
          <>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Name</span>
              <input name="name" required placeholder="e.g. Party pack" className="w-full rounded-lg border-2 border-plum/25 px-3 py-2" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Description</span>
              <input name="detail" required placeholder="Brief item description" className="w-full rounded-lg border-2 border-plum/25 px-3 py-2" />
            </label>
          </>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Price (₦)</span>
          <input name="price" type="number" min="0" step="1" required className="w-full rounded-lg border-2 border-plum/25 px-3 py-2" />
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input name="active" type="checkbox" defaultChecked className="size-4 accent-cherry" />
          Available immediately
        </label>

        <button type="submit" className="w-fit rounded-full bg-plum px-5 py-2 font-semibold text-white">
          Add item
        </button>
      </div>
    </form>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
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
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-cherry">Dee&apos;s Treats</p>
          <h1 className="mt-1 font-display text-4xl font-black">Menu dashboard</h1>
          <p className="mt-2">Signed in as {session.email}</p>
        </div>
        <form action={logout}>
          <button className="rounded-full border-2 border-plum px-5 py-2 font-semibold">Sign out</button>
        </form>
      </div>

      {saved && <p role="status" className="mt-6 rounded-lg bg-green-50 px-4 py-3 font-semibold text-green-800">{saved}</p>}
      {error && <p role="alert" className="mt-6 rounded-lg bg-frosting-soft px-4 py-3 font-semibold">{error}</p>}

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-bold">Cake sizes</h2>
          <span className="text-sm text-plum/70">{cakes.length} items</span>
        </div>
        <AddMenuForm table="cake_sizes" />
        <div className="mt-4 space-y-3">
          {cakes.map((item) => (
            <MenuEditor key={item.id} table="cake_sizes" id={item.id} label={item.label} price={item.price} active={item.active} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-bold">Small chops</h2>
          <span className="text-sm text-plum/70">{chops.length} items</span>
        </div>
        <AddMenuForm table="small_chops" />
        <div className="mt-4 space-y-3">
          {chops.map((item) => (
            <MenuEditor key={item.id} table="small_chops" id={item.id} name={item.name} detail={item.detail} price={item.price} active={item.active} />
          ))}
        </div>
      </section>

      <p className="mt-8 text-sm text-plum/70">
        Changes to menu items appear on the public website after saving. Removed items are deleted permanently.
      </p>
    </main>
  );
}
