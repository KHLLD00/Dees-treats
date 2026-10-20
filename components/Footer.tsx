import { BUSINESS } from "@/lib/menu";

export default function Footer() {
  return (
    <footer>
      <div aria-hidden className="gingham h-5" />
      <div className="bg-plum text-frosting-soft">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-3xl font-black text-icing">{BUSINESS.name}</p>
            <p className="mt-1">{BUSINESS.tagline}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <a href={`tel:${BUSINESS.phone}`} className="text-lg font-semibold text-icing underline underline-offset-4">
              {BUSINESS.phone}
            </a>
            <a
              href={`https://wa.me/${BUSINESS.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
