import Image from "next/image";
import Link from "next/link";
import { PHOTO_SIZE, photoByName } from "@/lib/gallery";
import { CATEGORIES, formatNaira } from "@/lib/menu";
import { LEAD_HOURS } from "@/lib/schedule";

const STEPS = [
  { title: "Pick what you want", text: "Choose a cake or a small chops pack." },
  { title: "Add the details", text: "Size, flavour and design notes, or how many packs." },
  { title: "Choose pickup or delivery", text: "Select a date and time that works for you." },
  { title: "Send on WhatsApp", text: "Your order goes straight to us and we confirm there." },
];

const hero = photoByName("cake-crown");
const cakePhoto = photoByName("cake-pink-flowers");
const chopsPhoto = photoByName("chops-foil-box");
const recent = [
  photoByName("bento-cake"),
  photoByName("loaves-tray"),
  photoByName("puff-puff-sieve"),
  photoByName("cake-yellow-roses"),
];

export default function Home() {
  return (
    <>
      <section className="bg-frosting">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 md:grid-cols-[1.15fr_0.85fr] md:py-20">
          <div>
            <h1 className="font-display text-[2.7rem] font-black leading-[1.02] tracking-tight md:text-7xl">
              Cakes and small chops for your next party.
            </h1>
            <p className="mt-6 max-w-[44ch] text-lg md:text-xl">
              Dee&apos;s bakes custom cakes and small chops to order. Pick what you need, choose a date and send your
              order to us on WhatsApp.
            </p>
            <p className="mt-4 font-semibold">
              Cakes need {LEAD_HOURS.cake} hours notice. Small chops need {LEAD_HOURS["small-chops"]} hours.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/order"
                className="rounded-full bg-cherry px-8 py-3.5 text-center text-lg font-semibold text-white transition hover:bg-cherry-deep"
              >
                Order now
              </Link>
              <Link
                href="/menu"
                className="rounded-full border-2 border-plum px-8 py-3.5 text-center text-lg font-semibold text-plum transition hover:bg-frosting-soft"
              >
                See the menu
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm pt-8 md:max-w-none">
            <div className="tag-swing absolute right-6 top-0 z-10 flex flex-col items-center">
              <span aria-hidden className="h-6 w-0.5 bg-plum" />
              <div className="-mt-px rounded-md bg-apricot px-4 py-2 text-center shadow-md">
                <p className="text-sm font-semibold">Cakes from</p>
                <p className="font-display text-2xl font-bold">{formatNaira(CATEGORIES.cake.startingPrice)}</p>
              </div>
            </div>
            <Image
              src={hero.src}
              alt={hero.alt}
              {...PHOTO_SIZE}
              priority
              className="aspect-[4/5] w-full rounded-xl border-8 border-icing object-cover shadow-lg"
            />
          </div>
        </div>
      </section>
      <div aria-hidden className="gingham h-5" />

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <h2 className="font-display text-4xl font-bold md:text-5xl">What we make</h2>
        <div className="mt-10 grid gap-12 md:grid-cols-[1.25fr_1fr] md:gap-10">
          <Link href="/menu" className="group block">
            <Image
              src={cakePhoto.src}
              alt={cakePhoto.alt}
              {...PHOTO_SIZE}
              className="aspect-[4/5] w-full rounded-xl object-cover"
            />
            <h3 className="mt-5 font-display text-3xl font-bold group-hover:underline group-hover:decoration-cherry group-hover:decoration-[3px] group-hover:underline-offset-8">
              {CATEGORIES.cake.label}
            </h3>
            <p className="mt-1 text-lg">{CATEGORIES.cake.blurb}.</p>
            <p className="mt-2 font-semibold text-cherry">
              From {formatNaira(CATEGORIES.cake.startingPrice)}. Order {LEAD_HOURS.cake} hours ahead.
            </p>
          </Link>
          <Link href="/menu" className="group block md:mt-24">
            <Image
              src={chopsPhoto.src}
              alt={chopsPhoto.alt}
              {...PHOTO_SIZE}
              className="aspect-square w-full rounded-xl object-cover"
            />
            <h3 className="mt-5 font-display text-3xl font-bold group-hover:underline group-hover:decoration-cherry group-hover:decoration-[3px] group-hover:underline-offset-8">
              {CATEGORIES["small-chops"].label}
            </h3>
            <p className="mt-1 text-lg">{CATEGORIES["small-chops"].blurb}.</p>
            <p className="mt-2 font-semibold text-cherry">
              From {formatNaira(CATEGORIES["small-chops"].startingPrice)}. Order {LEAD_HOURS["small-chops"]} hours
              ahead.
            </p>
          </Link>
        </div>
      </section>

      <section className="bg-frosting-soft">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl font-bold md:text-5xl">Recent bakes</h2>
            <Link href="/menu#photos" className="font-semibold underline decoration-cherry decoration-[3px] underline-offset-8">
              See all photos
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {recent.map((photo, i) => (
              <li key={photo.src} className={i % 2 === 1 ? "md:mt-10" : ""}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  {...PHOTO_SIZE}
                  className="aspect-[4/5] w-full rounded-lg object-cover"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[0.8fr_1.2fr] md:py-24">
        <div>
          <h2 className="font-display text-4xl font-bold md:text-5xl">How ordering works</h2>
          <p className="mt-4 max-w-[36ch] text-lg">Four short steps. We confirm the final price and payment with you on WhatsApp.</p>
          <Link
            href="/order"
            className="mt-6 inline-block rounded-full bg-cherry px-8 py-3.5 text-lg font-semibold text-white transition hover:bg-cherry-deep"
          >
            Start your order
          </Link>
        </div>
        <ol className="rounded-xl border-2 border-dashed border-plum/30 bg-white px-6 py-2 md:px-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-5 border-b-2 border-dotted border-plum/25 py-6 last:border-b-0">
              <span aria-hidden className="w-10 shrink-0 font-display text-5xl font-black leading-none text-cherry">
                {i + 1}
              </span>
              <div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-1">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
