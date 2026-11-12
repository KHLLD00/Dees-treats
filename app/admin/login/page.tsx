import { login } from "../actions";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-[75vh] max-w-md items-center px-5 py-16">
      <section className="w-full rounded-2xl border-2 border-plum/15 bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-cherry">Dee&apos;s Treats</p>
        <h1 className="mt-2 font-display text-3xl font-black">Admin sign in</h1>
        <p className="mt-2">Sign in to update menu prices and item availability.</p>
        <form action={login} className="mt-7 space-y-4">
          <label className="block"><span className="mb-2 block font-semibold">Admin email</span>
            <input name="email" type="email" autoComplete="username" required className="w-full rounded-lg border-2 border-plum/30 px-4 py-3" />
          </label>
          <label className="block"><span className="mb-2 block font-semibold">Password</span>
            <input name="password" type="password" autoComplete="current-password" required className="w-full rounded-lg border-2 border-plum/30 px-4 py-3" />
          </label>
          {error && <p role="alert" className="rounded-lg bg-frosting-soft px-4 py-3 text-sm font-semibold">{error}</p>}
          <button type="submit" className="w-full rounded-full bg-cherry px-6 py-3 font-semibold text-white hover:bg-cherry-deep">Sign in</button>
        </form>
        <a href="/" className="mt-6 inline-block font-semibold underline underline-offset-4">Back to website</a>
      </section>
    </main>
  );
}
