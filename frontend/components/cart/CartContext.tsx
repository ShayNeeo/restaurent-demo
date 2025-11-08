"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

export type CartItem = {
  productId: string;
  name: string;
  unitAmount: number;
  quantity: number;
  currency: string;
};

export type CouponInfo = {
  code: string;
  amountOff?: number;
  percentOff?: number;
  label: string;
};

type CartSnapshot = {
  items: CartItem[];
  coupon?: CouponInfo;
};

type CartContextValue = {
  items: CartItem[];
  coupon?: CouponInfo;
  subtotal: number;
  discount: number;
  total: number;
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  applyCoupon: (coupon: CouponInfo) => void;
  removeCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const STORAGE_KEY = "restaurant_cart_v1";

const CartContext = createContext<CartContextValue | undefined>(undefined);

function calculateDiscount(subtotal: number, coupon?: CouponInfo) {
  if (!coupon) {
    return 0;
  }

  if (coupon.amountOff) {
    return Math.min(subtotal, coupon.amountOff);
  }

  if (coupon.percentOff) {
    return Math.round((subtotal * coupon.percentOff) / 100);
  }

  return 0;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<CouponInfo | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const isHydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartSnapshot;
        setItems(parsed.items || []);
        setCoupon(parsed.coupon);
      }
    } catch (error) {
      console.warn("[cart] Failed to hydrate from storage", error);
    } finally {
      isHydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!isHydrated.current) {
      return;
    }

    const snapshot: CartSnapshot = { items, coupon };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [items, coupon]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.unitAmount * Math.max(item.quantity, 0),
        0
      ),
    [items]
  );

  const discount = useMemo(
    () => calculateDiscount(subtotal, coupon),
    [subtotal, coupon]
  );

  const total = useMemo(
    () => Math.max(0, subtotal - discount),
    [subtotal, discount]
  );

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.productId === item.productId);
      if (existing) {
        return prev.map((p) =>
          p.productId === item.productId
            ? {
                ...p,
                quantity: Math.min(999, p.quantity + item.quantity)
              }
            : p
        );
      }
      return [...prev, { ...item, quantity: Math.max(1, item.quantity) }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((p) =>
          p.productId === productId
            ? { ...p, quantity: Math.max(0, Math.min(999, quantity)) }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(undefined);
  }, []);

  const applyCoupon = useCallback((info: CouponInfo) => {
    setCoupon(info);
  }, []);

  const removeCoupon = useCallback(() => {
    setCoupon(undefined);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(
    () => setIsOpen((prev) => !prev),
    []
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      coupon,
      subtotal,
      discount,
      total,
      isOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      openCart,
      closeCart,
      toggleCart
    }),
    [
      items,
      coupon,
      subtotal,
      discount,
      total,
      isOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      openCart,
      closeCart,
      toggleCart
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}

