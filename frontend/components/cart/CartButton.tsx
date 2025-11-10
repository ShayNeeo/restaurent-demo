"use client";

import { useMemo } from "react";
import { useCart } from "./CartContext";

export function CartButton() {
  const { items, toggleCart } = useCart();
  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return (
    <button
      type="button"
      onClick={toggleCart}
      className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-white transition hover:border-white hover:bg-white/20"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 7.5l-.503 8.043A2 2 0 0 0 8.24 17.67h7.52a2 2 0 0 0 1.992-2.127L17.25 7.5m-10.5 0h10.5M6.75 7.5l.5-2.958A2 2 0 0 0 9.232 3h5.536a2 2 0 0 1 1.982 1.542l.5 2.958m-7.25 0V9a3 3 0 0 0 6 0V7.5"
        />
      </svg>
      <span>Cart</span>
      {totalQuantity > 0 ? (
        <span className="absolute -right-2 -top-2 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-yellow-400 px-1 text-xs font-bold text-gray-900 shadow-lg">
          {totalQuantity}
        </span>
      ) : null}
    </button>
  );
}

