import type { Metadata } from "next";
import HomePage from "../page";

export const metadata: Metadata = {
  title: "Nguyen Vietnam Restaurant Munich | English Menu & Reservations",
  description:
    "Discover Nguyen Vietnam Restaurant in Munich-Schwabing. English-friendly staff, authentic Vietnamese dishes, takeaway and dine-in reservations via nguyenrestaurant.de."
};

export default function EnglishPage() {
  return <HomePage />;
}

