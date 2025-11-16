import type { Metadata } from "next";
import HomePage from "../page";

export const metadata: Metadata = {
  title: "Nhà hàng Nguyễn tại München | Đặt bàn & Thực đơn tiếng Việt",
  description:
    "Thưởng thức ẩm thực Việt Nam chính hiệu tại Nguyễn Vietnam Restaurant ở quận Schwabing, München. Hỗ trợ tiếng Việt và đặt bàn online qua nguyenrestaurant.de."
};

export default function VietnamesePage() {
  return <HomePage />;
}

