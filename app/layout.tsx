import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MobileTabs } from "@/components/Nav";
import "./globals.css";

const fraunces = localFont({
  src: [
    { path: "./fonts/Fraunces72ptSoft-Bold.ttf", weight: "700" },
    { path: "./fonts/Fraunces72ptSoft-Black.ttf", weight: "900" },
  ],
  variable: "--font-fraunces",
});

const figtree = localFont({
  src: [
    { path: "./fonts/Figtree-Regular.ttf", weight: "400" },
    { path: "./fonts/Figtree-Medium.ttf", weight: "500" },
    { path: "./fonts/Figtree-SemiBold.ttf", weight: "600" },
  ],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "Dee's Treats | Custom cakes and small chops",
  description:
    "Order custom cakes and small chops from Dee's Treats. Pick your items, choose a date and send your order on WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${figtree.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col pb-20 md:pb-0">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-plum focus:px-5 focus:py-2 focus:font-semibold focus:text-icing"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <MobileTabs />
      </body>
    </html>
  );
}
