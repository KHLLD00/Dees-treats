import Image from "next/image";
import Link from "next/link";
import { BUSINESS } from "@/lib/menu";
import { DesktopNav } from "./Nav";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-blush bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
        <Link href="/" aria-label={`${BUSINESS.name} home`}>
          <Image
            src="/brand/logo-mark.webp"
            alt={BUSINESS.name}
            width={220}
            height={158}
            className="h-14 w-auto"
            priority
          />
        </Link>
        <DesktopNav />
        <a
          href={`tel:${BUSINESS.phone}`}
          className="rounded-full border-2 border-blush px-4 py-2 text-sm font-medium text-plum md:hidden"
        >
          Call us
        </a>
      </div>
    </header>
  );
}
