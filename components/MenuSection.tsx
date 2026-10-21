import Image from "next/image";
import { PHOTO_SIZE, photoByName } from "@/lib/gallery";
import { CAKE_FLAVOURS, CAKE_SIZES, formatNaira, SMALL_CHOPS } from "@/lib/menu";
import { LEAD_HOURS } from "@/lib/schedule";

const cakePhoto = photoByName("cake-crown");
const chopsPhoto = photoByName("chops-bowl");

function Leader() {
  return <span aria-hidden className="mb-1.5 min-w-6 flex-1 border-b-2 border-dotted border-plum/40" />;
}

export default function MenuSection() {
  return (
    <section id="menu" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 md:py-24">
      <h2 className="font-display text-5xl font-black md:text-6xl">Menu</h2>
      <p className="mt-4 max-w-[52ch] text-lg">We confirm your final price on WhatsApp after you send your order.</p>

      <div className="mt-14 grid items-start gap-10 md:grid-cols-[1fr_20rem] md:gap-16">
        <div>
          <h3 className="font-display text-4xl font-bold">Cakes</h3>
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
      </div>

      <div className="mt-20 grid items-start gap-10 md:grid-cols-[20rem_1fr] md:gap-16">
        <Image
          src={chopsPhoto.src}
          alt={chopsPhoto.alt}
          {...PHOTO_SIZE}
          className="aspect-[4/5] w-full max-w-xs rounded-xl object-cover md:sticky md:top-28 md:max-w-none"
        />
        <div>
          <h3 className="font-display text-4xl font-bold">Small chops</h3>
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
      </div>

      <div className="mt-14">
        <a
          href="#order"
          className="inline-block rounded-full bg-cherry px-8 py-3.5 text-lg font-semibold text-white transition hover:bg-cherry-deep"
        >
          Order now
        </a>
      </div>
    </section>
  );
}
