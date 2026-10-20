import Image from "next/image";
import Link from "next/link";
import { FEATURED, PHOTO_SIZE } from "@/lib/gallery";
import { BUSINESS, CATEGORIES, formatNaira } from "@/lib/menu";
import { LEAD_HOURS } from "@/lib/schedule";

const STEPS = [
  { title: "Pick what you want", text: "Choose a cake or a small chops pack." },
  { title: "Add the details", text: "Size, flavour and design notes, or how many packs." },
  { title: "Choose pickup or delivery", text: "Select a date and time that works for you." },
  { title: "Send on WhatsApp", text: "Your order goes straight to us and we confirm there." },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-petal">
        <div aria-hidden className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-lilac" />
        <div aria-hidden className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-blush" />
        <div className="relative mx-auto grid max-w-5xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
          <div className="text-center md:text-left">
            <h1 className="font-display text-4xl leading-tight text-plum md:text-5xl">
              Treat yourself right with Dee&apos;s!
            </h1>
            <p className="mt-4 text-lg">
              Custom cakes and small chops, made to order. Book in a minute and confirm on WhatsApp.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Link
                href="/order"
                className="rounded-full bg-berry px-7 py-3 text-center font-medium text-white transition hover:bg-plum"
              >
                Order now
              </Link>
              <Link
                href="/menu"
                className="rounded-full border-2 border-plum px-7 py-3 text-center font-medium text-plum transition hover:bg-white"
              >
                See the menu
              </Link>
            </div>
          </div>
          <Image
            src="/brand/logo.webp"
            alt={`${BUSINESS.name} logo, a pink cupcake with a cherry`}
            width={500}
            height={500}
            priority
            className="mx-auto w-64 rounded-[2.5rem] shadow-lg md:w-80"
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="font-display text-3xl text-plum">What we make</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[]).map((key) => (
            <Link
              key={key}
              href="/menu"
              className="rounded-3xl border-2 border-blush bg-white p-6 transition hover:border-berry"
            >
              <h3 className="font-display text-2xl text-plum">{CATEGORIES[key].label}</h3>
              <p className="mt-1">{CATEGORIES[key].blurb}</p>
              <p className="mt-4 text-sm font-medium text-berry">
                From {formatNaira(CATEGORIES[key].startingPrice)} · order {LEAD_HOURS[key]} hours ahead
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <h2 className="font-display text-3xl text-plum">Fresh from the kitchen</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {FEATURED.map((photo) => (
            <li key={photo.src}>
              <Link href="/menu">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  {...PHOTO_SIZE}
                  className="aspect-[4/5] w-full rounded-3xl object-cover"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="font-display text-3xl text-plum">How ordering works</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-3xl bg-petal p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-berry font-display text-lg text-white">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold text-plum">{step.title}</h3>
                <p className="mt-1 text-sm">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h2 className="font-display text-3xl text-plum">Ready to order?</h2>
        <Link
          href="/order"
          className="mt-5 inline-block rounded-full bg-berry px-8 py-3 font-medium text-white transition hover:bg-plum"
        >
          Start your order
        </Link>
      </section>
    </>
  );
}
