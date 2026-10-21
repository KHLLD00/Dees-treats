import Image from "next/image";
import { PHOTO_SIZE, photoByName } from "@/lib/gallery";
import { BUSINESS, CAKE_FLAVOURS } from "@/lib/menu";
import { LEAD_NOTICE } from "@/lib/schedule";

const photo = photoByName("loaves-packed");

const FAQ = [
  {
    q: "How far ahead should I order?",
    a: `Please order ${LEAD_NOTICE} ahead, for cakes and small chops alike. Pick the date you need it by and we confirm it on WhatsApp.`,
  },
  {
    q: "How do I place an order?",
    a: "Fill in the order form and tap Review order. You get a receipt image. Tap Continue on WhatsApp, attach the receipt in the chat and send it. We confirm your order there.",
  },
  {
    q: "How and when do I pay?",
    a: "We confirm your final price and payment details with you on WhatsApp after you send your receipt.",
  },
  {
    q: "Do you deliver?",
    a: "Yes. Choose delivery on the order form and add your address. We confirm the delivery fee on WhatsApp. Pickup is also available.",
  },
  {
    q: "Can I send a reference photo for my cake?",
    a: "Yes. After your receipt is sent, share any inspiration photos in the same WhatsApp chat.",
  },
  {
    q: "What cake flavours are available?",
    a: `${CAKE_FLAVOURS.join(", ")}. Want something else? Mention it in your design notes and we will let you know.`,
  },
  {
    q: "I need to change my order. What do I do?",
    a: "Message us on WhatsApp as soon as you can and we will sort it out.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 md:py-24">
      <div className="grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr] md:gap-16">
        <div>
          <h2 className="font-display text-5xl font-black md:text-6xl">About Dee&apos;s Treats</h2>
          <p className="mt-6 max-w-[48ch] text-lg md:text-xl">
            {BUSINESS.name} bakes custom cakes and small chops to order, from simple birthday cakes to party packs for
            a crowd. {BUSINESS.tagline}
          </p>
        </div>
        <Image
          src={photo.src}
          alt={photo.alt}
          {...PHOTO_SIZE}
          className="aspect-[4/5] w-full max-w-xs rounded-xl object-cover md:max-w-none"
        />
      </div>

      <div className="mt-20 max-w-3xl">
        <h3 className="font-display text-4xl font-bold">FAQ</h3>
        <div className="mt-6 border-t-2 border-dotted border-plum/40">
          {FAQ.map((item) => (
            <details key={item.q} className="group border-b-2 border-dotted border-plum/40 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden
                  className="shrink-0 font-display text-3xl font-bold leading-none text-cherry transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-[60ch] text-lg">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-14 rounded-xl bg-frosting p-6 md:p-8">
          <p className="font-display text-3xl font-bold">Still have a question?</p>
          <p className="mt-2 text-lg">
            Call or WhatsApp{" "}
            <a href={`tel:${BUSINESS.phone}`} className="font-semibold underline underline-offset-4">
              {BUSINESS.phone}
            </a>
            .
          </p>
          <a
            href="#order"
            className="mt-5 inline-block rounded-full bg-cherry px-8 py-3.5 text-lg font-semibold text-white transition hover:bg-cherry-deep"
          >
            Start your order
          </a>
        </div>
      </div>
    </section>
  );
}
