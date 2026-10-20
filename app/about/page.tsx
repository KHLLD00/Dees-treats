import Link from "next/link";
import { BUSINESS, CAKE_FLAVOURS } from "@/lib/menu";
import { LEAD_HOURS } from "@/lib/schedule";

export const metadata = {
  title: "About & FAQ | Dee's Treats",
  description: "About Dee's Treats and answers to common ordering questions.",
};

const FAQ = [
  {
    q: "How far ahead should I order?",
    a: `Cakes need ${LEAD_HOURS.cake} hours notice. Small chops need ${LEAD_HOURS["small-chops"]} hours. The order form only lets you pick dates that fit.`,
  },
  {
    q: "How do I place an order?",
    a: "Fill in the order form and tap send. It opens WhatsApp with your order already written out, and we confirm it there.",
  },
  {
    q: "How and when do I pay?",
    a: "We confirm your final price and payment details with you on WhatsApp after you send your order.",
  },
  {
    q: "Do you deliver?",
    a: "Yes. Choose delivery on the order form and add your address. We confirm the delivery fee on WhatsApp. Pickup is also available.",
  },
  {
    q: "Can I send a reference photo for my cake?",
    a: "Yes. After your order message is sent, share any inspiration photos in the same WhatsApp chat.",
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

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl text-plum">About Dee&apos;s Treats</h1>
      <p className="mt-4 text-lg">
        {BUSINESS.name} bakes custom cakes and small chops to order, from simple birthday cakes to party packs for a crowd.
        {" "}{BUSINESS.tagline}
      </p>

      <h2 className="mt-12 font-display text-3xl text-plum">FAQ</h2>
      <div className="mt-4 space-y-3">
        {FAQ.map((item) => (
          <details key={item.q} className="group rounded-3xl border-2 border-blush bg-white px-5 py-4">
            <summary className="cursor-pointer list-none font-semibold text-plum">
              <span className="flex items-center justify-between gap-4">
                {item.q}
                <span aria-hidden className="text-berry transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-petal p-6 text-center">
        <p className="font-display text-2xl text-plum">Still have a question?</p>
        <p className="mt-1">
          Call or WhatsApp{" "}
          <a href={`tel:${BUSINESS.phone}`} className="font-semibold text-plum">
            {BUSINESS.phone}
          </a>
          .
        </p>
        <Link
          href="/order"
          className="mt-4 inline-block rounded-full bg-berry px-8 py-3 font-medium text-white transition hover:bg-plum"
        >
          Start your order
        </Link>
      </div>
    </div>
  );
}
