import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gutscheine & Geschenkgutscheine",
  description:
    "Kaufen Sie Geschenkgutscheine für NGUYEN Vietnam Restaurant mit 10% Bonus. Gutscheincodes prüfen und einlösen. Digitale Gutscheine per E-Mail.",
  keywords: [
    "restaurant gutschein münchen",
    "geschenkgutschein vietnamesisches restaurant",
    "gutschein einlösen",
    "restaurant gutschein online kaufen",
    "nguyen restaurant gutschein"
  ],
  alternates: {
    canonical: "https://nguyenrestaurant.de/coupon",
    languages: {
      "de-DE": "https://nguyenrestaurant.de/coupon",
      en: "https://nguyenrestaurant.de/en/coupon",
      vi: "https://nguyenrestaurant.de/vi/coupon",
      "x-default": "https://nguyenrestaurant.de/coupon"
    }
  },
  openGraph: {
    title: "Gutscheine | NGUYEN Vietnam Restaurant",
    description:
      "Geschenkgutscheine mit 10% Bonus kaufen oder Gutscheincodes einlösen. Digitale Gutscheine für NGUYEN Vietnam Restaurant.",
    url: "https://nguyenrestaurant.de/coupon",
    siteName: "NGUYEN Vietnam Restaurant München",
    images: [
      {
        url: "/images/view-2.jpg",
        width: 1200,
        height: 630,
        alt: "Restaurant Gutscheine - NGUYEN Vietnam Restaurant"
      }
    ],
    locale: "de_DE",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Gutscheine | NGUYEN Vietnam Restaurant",
    description: "Geschenkgutscheine mit 10% Bonus - Jetzt kaufen"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function CouponLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}

