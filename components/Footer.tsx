import { BUSINESS } from "@/lib/menu";

export default function Footer() {
  return (
    <footer className="bg-plum text-petal">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div>
          <p className="font-display text-xl text-white">{BUSINESS.name}</p>
          <p className="text-sm">{BUSINESS.tagline}</p>
        </div>
        <div className="flex flex-col gap-1 text-sm md:items-end">
          <a href={`tel:${BUSINESS.phone}`} className="font-medium text-white">
            {BUSINESS.phone}
          </a>
          <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
