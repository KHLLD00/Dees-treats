import Image from "next/image";
import Link from "next/link";
import { GALLERY, PHOTO_SIZE, photoByName } from "@/lib/gallery";
import { CAKE_FLAVOURS, CAKE_SIZES, formatNaira, SMALL_CHOPS } from "@/lib/menu";
import { LEAD_HOURS } from "@/lib/schedule";

export const metadata = {
  title: "Menu | Dee's Treats",
  description: "Cake sizes and small chops packs with prices.",
};

const cakePhoto = photoByName("cake-crown");
const chopsPhoto = photoByName("chops-bowl");

function Leader() {
  return <span aria-hidden className="mb-1.5 min-w-6 flex-1 border-b-2 border-dotted border-plum/40" />;
}

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <h1 className="font-display text-5xl font-black md:text-7xl">Menu</h1>
      <p className="mt-4 max-w-[52ch] text-lg">
        We confirm your final price on WhatsApp after you send your order.
      </p>

      <section className="mt-14 grid items-start gap-10 md:grid-cols-[1fr_20rem] md:gap-16">
        <div>
          <h2 className="font-display text-4xl font-bold">Cakes</h2>
          <p className="mt-2 max-w-[52ch]">
            Order {LEAD_HOURS.cake} hours ahead. Flavours: {CAKE_FLAVOURS.join(", ")}. Tell us your design when you
            order.
          </p>
          <ul className="mt-6">
            {CAKE_SIZES.map((size) => (
              <li key={size.id} className="flex items-end gap-3 py-2.5 text-xl">
                <span className="font-semibold">{size.label} cake</span>
                <Leader />
                <span className="font-display text-2xl font-bold text-cherry">{formatNaira(size.price)}</span>
              </li>
            ))}
          </ul>
        </div>
        <Image
          src={cakePhoto.src}
          alt={cakePhoto.alt}
          {...PHOTO_SIZE}
          className="aspect-[4/5] w-full max-w-xs rounded-xl object-cover md:sticky md:top-28 md:max-w-none"
        />
      </section>

      <section className="mt-20 grid items-start gap-10 md:grid-cols-[20rem_1fr] md:gap-16">
        <Image
          src={chopsPhoto.src}
          alt={chopsPhoto.alt}
          {...PHOTO_SIZE}
          className="aspect-[4/5] w-full max-w-xs rounded-xl object-cover md:sticky md:top-28 md:max-w-none"
        />
        <div>
          <h2 className="font-display text-4xl font-bold">Small chops</h2>
          <p className="mt-2">Order {LEAD_HOURS["small-chops"]} hours ahead.</p>
          <ul className="mt-6">
            {SMALL_CHOPS.map((item) => (
              <li key={item.id} className="py-3">
                <div className="flex items-end gap-3 text-xl">
                  <span className="font-semibold">{item.name}</span>
                  <Leader />
                  <span className="font-display text-2xl font-bold text-cherry">{formatNaira(item.price)}</span>
                </div>
                <p className="mt-0.5 max-w-[48ch]">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-14">
        <Link
          href="/order"
          className="inline-block rounded-full bg-cherry px-8 py-3.5 text-lg font-semibold text-white transition hover:bg-cherry-deep"
        >
          Order now
        </Link>
      </div>

      <section id="photos" className="mt-24 scroll-mt-24">
        <h2 className="font-display text-4xl font-bold md:text-5xl">Photos</h2>
        {GALLERY.map((group) => (
          <div key={group.title} className="mt-10">
            <h3 className="font-display text-2xl font-bold">{group.title}</h3>
            <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {group.photos.map((photo) => (
                <li key={photo.src}>
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
        ))}
      </section>
    </div>
  );
}
