"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
  { href: "/about", label: "About & FAQ" },
];

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        const isOrder = link.href === "/order";
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              isOrder
                ? "rounded-full bg-cherry px-6 py-2.5 font-semibold text-white transition hover:bg-cherry-deep"
                : `font-semibold text-plum underline-offset-8 decoration-cherry decoration-[3px] hover:underline ${active ? "underline" : ""}`
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 gap-1 border-t border-plum/15 bg-icing px-2 py-2 md:hidden"
    >
      {LINKS.map((link) => {
        const active = pathname === link.href;
        const isOrder = link.href === "/order";
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-12 items-center justify-center rounded-full text-center text-sm font-semibold ${
              isOrder
                ? "bg-cherry text-white"
                : `text-plum underline-offset-4 decoration-cherry decoration-2 ${active ? "underline" : ""}`
            }`}
          >
            {link.label === "About & FAQ" ? "About" : link.label}
          </Link>
        );
      })}
    </nav>
  );
}
