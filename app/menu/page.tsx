import Image from "next/image";
import Link from "next/link";
import { GALLERY, PHOTO_SIZE } from "@/lib/gallery";
import { CAKE_FLAVOURS, CAKE_SIZES, formatNaira, SMALL_CHOPS } from "@/lib/menu";
import { LEAD_HOURS } from "@/lib/schedule";

export const metadata = {
  title: "Menu | Dee's Treats",
  description: "Cake sizes and small chops packs with prices.",
};

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-4xl text-plum">Menu</h1>

      <section className="mt-8">
        <h2 className="font-display text-2xl text-plum">Cakes</h2>
        <p className="mt-1 text-sm">
          Order {LEAD_HOURS.cake} hours ahead. Flavours: {CAKE_FLAVOURS.join(", ")}. Tell us your design when you order.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CAKE_SIZES.map((size) => (
            <li key={size.id} className="rounded-3xl border-2 border-blush bg-white p-4 text-center">
              <p className="font-semibold text-plum">{size.label} cake</p>
              <p className="mt-2 inline-block rounded-full bg-berry px-4 py-1 font-medium text-white">
                {formatNaira(size.price)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-plum">Small chops</h2>
        <p className="mt-1 text-sm">Order {LEAD_HOURS["small-chops"]} hours ahead.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {SMALL_CHOPS.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-3xl border-2 border-blush bg-white p-4"
            >
              <div>
                <p className="font-semibold text-plum">{item.name}</p>
                <p className="text-sm">{item.detail}</p>
              </div>
              <p className="shrink-0 rounded-full bg-berry px-4 py-1 font-medium text-white">
                {formatNaira(item.price)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 text-center">
        <Link
          href="/order"
          className="inline-block rounded-full bg-berry px-8 py-3 font-medium text-white transition hover:bg-plum"
        >
          Order now
        </Link>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl text-plum">Gallery</h2>
        {GALLERY.map((group) => (
          <div key={group.title} className="mt-6">
            <h3 className="font-display text-xl text-plum">{group.title}</h3>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {group.photos.map((photo) => (
                <li key={photo.src}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    {...PHOTO_SIZE}
                    className="aspect-[4/5] w-full rounded-3xl object-cover"
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
