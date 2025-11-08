import "./globals.css";

import type { Metadata } from "next";
import { Kaushan_Script, Montserrat } from "next/font/google";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Preloader } from "@/components/Preloader";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"]
});

const kaushan = Kaushan_Script({
  subsets: ["latin"],
  variable: "--font-kaushan",
  weight: ["400"]
});

export const metadata: Metadata = {
  title: "NGUYEN | Vietnamesisches Restaurant in München-Schwabing",
  description:
    "Genießen Sie authentische vietnamesische Küche im Herzen von München-Schwabing. Reservierungen unter 089 28803451.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${montserrat.variable} ${kaushan.variable} bg-brand-light text-slate-900 antialiased`}
      >
        <CartProvider>
          <Preloader />
          <CartDrawer />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

