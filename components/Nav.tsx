const LINKS = [
  { href: "#menu", label: "Menu" },
  { href: "#photos", label: "Photos" },
  { href: "#order", label: "Order" },
  { href: "#about", label: "About" },
];

export function DesktopNav() {
  return (
    <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
      {LINKS.map((link) => {
        const isOrder = link.href === "#order";
        return (
          <a
            key={link.href}
            href={link.href}
            className={
              isOrder
                ? "rounded-full bg-cherry px-6 py-2.5 font-semibold text-white transition hover:bg-cherry-deep"
                : "font-semibold text-plum decoration-cherry decoration-[3px] underline-offset-8 hover:underline"
            }
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}

export function MobileTabs() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 gap-1 border-t border-plum/15 bg-icing px-2 py-2 md:hidden"
    >
      {LINKS.map((link) => {
        const isOrder = link.href === "#order";
        return (
          <a
            key={link.href}
            href={link.href}
            className={`flex min-h-12 items-center justify-center rounded-full text-center text-sm font-semibold ${
              isOrder ? "bg-cherry text-white" : "text-plum"
            }`}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
