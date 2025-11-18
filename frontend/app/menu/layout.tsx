import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Speisekarte | Vietnamesische Küche",
  description:
    "Entdecken Sie unsere authentische vietnamesische Speisekarte in München-Schwabing. Frisch zubereitete Gerichte, vegetarische Optionen und traditionelle Rezepte. Online bestellen oder reservieren.",
  keywords: [
    "vietnamesische speisekarte münchen",
    "pho münchen",
    "vietnamesisches restaurant speisekarte",
    "online bestellen münchen",
    "vietnamesische gerichte",
    "authentische vietnamesische küche"
  ],
  alternates: {
    canonical: "https://nguyenrestaurant.de/menu",
    languages: {
      "de-DE": "https://nguyenrestaurant.de/menu",
      en: "https://nguyenrestaurant.de/en/menu",
      vi: "https://nguyenrestaurant.de/vi/menu",
      "x-default": "https://nguyenrestaurant.de/menu"
    }
  },
  openGraph: {
    title: "Speisekarte | NGUYEN Vietnam Restaurant München",
    description:
      "Authentische vietnamesische Speisekarte mit frisch zubereiteten Gerichten. Online bestellen oder reservieren unter +49 89 28803451.",
    url: "https://nguyenrestaurant.de/menu",
    siteName: "NGUYEN Vietnam Restaurant München",
    images: [
      {
        url: "/images/pho-chay.jpg",
        width: 1200,
        height: 630,
        alt: "Vietnamesische Speisekarte - NGUYEN Restaurant"
      }
    ],
    locale: "de_DE",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Speisekarte | NGUYEN Vietnam Restaurant",
    description: "Authentische vietnamesische Küche in München-Schwabing"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function MenuLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}

