import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

// 04.1 — Inter, two weights, Turkish glyphs (latin-ext).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Atlas — Her indirimin bir sebebi var",
    template: "%s | Atlas",
  },
  description:
    "Teşhir, açık kutu ve fazla stok ürünleri doğrulanmış işletmelerden, Grade sistemiyle. Premium ürünler, dürüst fiyatlar, tam şeffaflık.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-inverse focus:px-4 focus:py-2 focus:text-ink-inverse"
        >
          İçeriğe atla
        </a>
        <Header />
        <main id="icerik" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
