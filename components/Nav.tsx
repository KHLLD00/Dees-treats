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
    <nav aria-label="Main" className="hidden items-center gap-2 md:flex">
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
                ? "rounded-full bg-berry px-5 py-2 font-medium text-white transition hover:bg-plum"
                : `rounded-full px-4 py-2 font-medium transition hover:bg-petal ${active ? "bg-petal text-plum" : "text-ink"}`
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
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-blush bg-white px-2 py-2 md:hidden"
    >
      {LINKS.map((link) => {
        const active = pathname === link.href;
        const isOrder = link.href === "/order";
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`mx-1 rounded-full py-2.5 text-center text-sm font-medium ${
              isOrder ? "bg-berry text-white" : active ? "bg-petal text-plum" : "text-ink"
            }`}
          >
            {link.label === "About & FAQ" ? "About" : link.label}
          </Link>
        );
      })}
    </nav>
  );
}
