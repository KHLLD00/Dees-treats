import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MobileTabs } from "@/components/Nav";
import "./globals.css";

const fredoka = localFont({
  src: "./fonts/fredoka-latin-wght-normal.woff2",
  variable: "--font-fredoka",
  weight: "300 700",
});

const poppins = localFont({
  src: [
    { path: "./fonts/poppins-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/poppins-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/poppins-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Dee's Treats | Custom cakes and small chops",
  description:
    "Order custom cakes and small chops from Dee's Treats. Pick your items, choose a date and send your order on WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fredoka.variable} ${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col pb-20 md:pb-0">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileTabs />
      </body>
    </html>
  );
}
