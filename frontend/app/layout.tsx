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
  metadataBase: new URL("https://nguyenrestaurent.de"),
  title: {
    default: "NGUYEN Vietnam Restaurant | München-Schwabing",
    template: "%s | NGUYEN Vietnam Restaurant"
  },
  description:
    "Nguyen Vietnam Restaurant in München-Schwabing serviert authentische vietnamesische Küche für deutsch-, englisch- und vietnamesischsprachige Gäste. Reservierungen unter +49 89 28803451.",
  keywords: [
    "Nguyen Restaurant",
    "vietnamesisches restaurant münchen",
    "authentic vietnamese food germany",
    "pho münchen schwabing",
    "vietnamesische speisekarte",
    "vietnamesisches restaurant vietnamese restaurant munich"
  ],
  category: "Restaurant",
  authors: [{ name: "Nguyen Vietnam Restaurant" }],
  creator: "Nguyen Vietnam Restaurant",
  publisher: "Nguyen Vietnam Restaurant",
  alternates: {
    canonical: "/",
    languages: {
      "de-DE": "/",
      en: "/en",
      vi: "/vi",
      "x-default": "/"
    }
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    alternateLocale: ["en_US", "vi_VN"],
    url: "/",
    siteName: "Nguyen Vietnam Restaurant München",
    title: "Nguyen Vietnam Restaurant | Authentische vietnamesische Küche in München",
    description:
      "Reservieren Sie Ihren Tisch bei Nguyen Vietnam Restaurant in München-Schwabing – authentische vietnamesische Küche für Gäste aus Deutschland, Europa und Vietnam.",
    images: [
      {
        url: "/images/view-2.jpg",
        width: 663,
        height: 510,
        alt: "Nguyen Vietnam Restaurant München-Schwabing"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@nguyenrestaurent",
    title: "Nguyen Vietnam Restaurant München",
    description:
      "Authentische vietnamesische Küche im Herzen von München-Schwabing – willkommen bei Nguyen Vietnam Restaurant.",
    images: ["/images/view-2.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: "/favicon.svg"
  },
  other: {
    "geo.position": "48.1598;11.5812",
    "geo.placename": "München",
    "geo.region": "DE-BY"
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

