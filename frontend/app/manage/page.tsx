"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QrScanner from "qr-scanner";

interface Product {
  id: string;
  name: string;
  unit_amount: number;
  currency: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

interface QRCode {
  id: string;
  code: string;
  balance: number;
  customer_email: string;
}

const PRODUCT_IMAGES: Record<string, string> = {
  lobster: "/images/bo-kho-goi-cuon.jpg",
  pho: "/images/pho-chay.jpg",
  bao: "/images/khai-vi-starter.jpg",
  gyoza: "/images/steamed-gyoza.jpg",
  curry: "/images/curry.jpg",
  bunthitxao: "/images/bun-thit-xao.jpg",
  friedgyoza: "/images/fried-gyoza.jpg",
  goicuon: "/images/goi-cuon.jpg"
};

export default function ManagePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [scannedQR, setScannedQR] = useState<QRCode | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef<QrScanner | null>(null);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const email = localStorage.getItem("restaurant_email_v1");
    const jwt = localStorage.getItem("restaurant_jwt_v1");

    if (!email || !jwt) {
      router.push("/admin/login");
      return;
    }

    setAuthenticated(true);
    fetchProducts();
    setLoading(false);
  }, [router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const response = await fetch(`${backendUrl}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Add item to order
  const addToOrder = (product: Product) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    calculateTotal();
  };

  // Remove item from order
  const removeFromOrder = (productId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.product.id !== productId));
    calculateTotal();
  };

  // Update item quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(productId);
      return;
    }
    setOrderItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
    calculateTotal();
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.product.unit_amount * item.quantity, 0);
    const discount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
    setTotalAmount(Math.max(0, subtotal - discount));
  };

  // Format price
  const formatPrice = (amount: number) => {
    return (amount / 100).toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR"
    });
  };

  // Start QR Scanner
  const startQRScanner = async () => {
    try {
      if (!videoRef.current) {
        console.error("Video ref not available");
        alert("Video element not ready. Please try again.");
        return;
      }
      
      // Check if QrScanner is already running
      if (scannerRef.current) {
        try {
          await scannerRef.current.start();
          setScannerActive(true);
          return;
        } catch (error) {
          console.error("Error restarting scanner:", error);
          scannerRef.current.destroy();
          scannerRef.current = null;
        }
      }

      // Request camera permissions first
      try {
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      } catch (permError) {
        console.error("Camera permission denied:", permError);
        alert("Camera permission denied. Please enable camera access in your browser settings.");
        return;
      }

      // Create new scanner instance
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log("QR Code detected:", result.data);
          handleManualQRInput(result.data);
        },
        {
          onDecodeError: (error) => {
            // Silently ignore decode errors - expected when no QR code is visible
          },
          maxScansPerSecond: 5,
          preferredCamera: "environment"
        }
      );

      scannerRef.current = scanner;
      console.log("Starting QR scanner...");
      await scanner.start();
      console.log("QR scanner started successfully");
      setScannerActive(true);
    } catch (error) {
      console.error("Error starting QR scanner:", error);
      alert(`Unable to start camera: ${error instanceof Error ? error.message : "Unknown error"}`);
      setScannerActive(false);
    }
  };

  // Stop QR Scanner
  const stopQRScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current = null;
    }
    setScannerActive(false);
    setShowScanner(false);
  };

  // Handle QR code scanning (automatically triggered by QrScanner)
  const handleManualQRInput = async (qrCode: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const jwt = localStorage.getItem("restaurant_jwt_v1");
      
      const response = await fetch(`${backendUrl}/api/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`
        },
        body: JSON.stringify({ code: qrCode })
      });

      if (response.ok) {
        const qr = await response.json();
        setScannedQR(qr);
        setCustomerEmail(qr.customer_email || "");
        stopQRScanner();
      } else {
        alert("Invalid QR code or coupon expired");
      }
    } catch (error) {
      console.error("Error validating QR code:", error);
      alert("Error validating QR code");
    }
  };

  // Apply discount coupon
  const applyDiscount = (discountPercent: number) => {
    setAppliedCoupon({ code: scannedQR?.code || "", discount: discountPercent });
    calculateTotal();
  };

  // Process checkout
  const handleCheckout = async () => {
    if (orderItems.length === 0) {
      alert("Please add items to the order");
      return;
    }

    if (!customerEmail) {
      alert("Please enter customer email or scan QR code");
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const jwt = localStorage.getItem("restaurant_jwt_v1");

      const orderData = {
        customer_email: customerEmail,
        items: orderItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_amount: item.product.unit_amount
        })),
        total_amount: totalAmount,
        qr_code_used: scannedQR?.code,
        discount_applied: appliedCoupon?.discount || 0
      };

      const response = await fetch(`${backendUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        
        // Send email to customer for PayPal checkout
        await fetch(`${backendUrl}/api/email/send-checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`
          },
          body: JSON.stringify({
            customer_email: customerEmail,
            order_id: order.id,
            total_amount: totalAmount,
            items: orderItems
          })
        });

        alert("Order created! Checkout link sent to customer email.");
        
        // Reset form
        setOrderItems([]);
        setScannedQR(null);
        setAppliedCoupon(null);
        setCustomerEmail("");
        setTotalAmount(0);
      } else {
        alert("Error creating order");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Error processing checkout");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center text-white">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-500 mb-2">Manager Panel</h1>
          <p className="text-gray-400">Manage orders, scan QR codes, and process payments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Products Menu */}
          <div className="lg:col-span-2 space-y-6">
            {/* QR Scanner Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-yellow-400">QR Code Scanner</h2>
                {!showScanner ? (
                  <button
                    onClick={() => {
                      setShowScanner(true);
                      startQRScanner();
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition"
                  >
                    Start Scanner
                  </button>
                ) : (
                  <button
                    onClick={stopQRScanner}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Stop Scanner
                  </button>
                )}
              </div>

              {showScanner ? (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg bg-black"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Or paste QR code manually..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value) {
                          handleManualQRInput(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>
              ) : scannedQR ? (
                <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
                  <p className="text-green-300 font-semibold">✓ QR Code Valid</p>
                  <p className="text-sm text-gray-300 mt-2">Customer: {scannedQR.customer_email}</p>
                  <p className="text-sm text-gray-300">Available Balance: {formatPrice(scannedQR.balance)}</p>
                  <button
                    onClick={() => {
                      setScannedQR(null);
                      setCustomerEmail("");
                    }}
                    className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Clear QR
                  </button>
                </div>
              ) : (
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-center text-gray-400">
                  <p>QR code scanner ready. Click "Start Scanner" to begin.</p>
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">Menu Items</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToOrder(product)}
                    className="group relative bg-gray-700 hover:bg-gray-600 rounded-lg overflow-hidden border border-gray-600 hover:border-yellow-500 transition"
                  >
                    <div className="relative h-32 bg-gradient-to-br from-amber-100 to-amber-50">
                      {PRODUCT_IMAGES[product.id.toLowerCase()] && (
                        <Image
                          src={PRODUCT_IMAGES[product.id.toLowerCase()]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition duration-300"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                      <p className="text-xs text-yellow-400 font-bold">{formatPrice(product.unit_amount)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-6">
            {/* Customer Email */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-yellow-400 mb-3">Customer Email</h3>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Order Items */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-yellow-400 mb-4">Order Items</h3>
              {orderItems.length === 0 ? (
                <p className="text-gray-400 text-sm">No items added yet</p>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.product.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-sm">{item.product.name}</p>
                        <button
                          onClick={() => removeFromOrder(item.product.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="bg-gray-600 hover:bg-gray-500 w-6 h-6 rounded text-xs"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                          className="flex-1 bg-gray-600 text-center text-sm rounded py-1"
                        />
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="bg-gray-600 hover:bg-gray-500 w-6 h-6 rounded text-xs"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-xs text-yellow-300 mt-2 text-right">
                        {formatPrice(item.product.unit_amount * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discount/Coupon */}
            {scannedQR && (
              <div className="bg-gray-800 rounded-lg p-6 border border-green-500/50">
                <h3 className="text-lg font-bold text-green-400 mb-3">Apply Discount</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => applyDiscount(10)}
                    className={`w-full py-2 rounded-lg font-semibold transition ${
                      appliedCoupon?.discount === 10
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }`}
                  >
                    10% Discount
                  </button>
                  <button
                    onClick={() => applyDiscount(20)}
                    className={`w-full py-2 rounded-lg font-semibold transition ${
                      appliedCoupon?.discount === 20
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }`}
                  >
                    20% Discount
                  </button>
                  <button
                    onClick={() => {
                      setAppliedCoupon(null);
                      calculateTotal();
                    }}
                    className="w-full py-2 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 text-gray-300 transition"
                  >
                    Clear Discount
                  </button>
                </div>
              </div>
            )}

            {/* Total & Checkout */}
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-6 border border-yellow-500">
              {scannedQR && (
                <div className="mb-4 pb-4 border-b border-yellow-500 bg-blue-700 bg-opacity-50 rounded p-3">
                  <p className="text-blue-100 text-sm">💳 Waiting Coupon Balance:</p>
                  <p className="text-2xl font-bold text-blue-100">{formatPrice(scannedQR.balance)}</p>
                </div>
              )}
              <div className="mb-4">
                <p className="text-yellow-100 text-sm mb-2">Subtotal:</p>
                <p className="text-2xl font-bold text-white">
                  {formatPrice(
                    orderItems.reduce((sum, item) => sum + item.product.unit_amount * item.quantity, 0)
                  )}
                </p>
              </div>
              {appliedCoupon && (
                <div className="mb-4 pb-4 border-b border-yellow-500">
                  <p className="text-yellow-100 text-sm">{appliedCoupon.discount}% Discount</p>
                  <p className="text-red-200 font-semibold">
                    −{formatPrice(
                      (orderItems.reduce((sum, item) => sum + item.product.unit_amount * item.quantity, 0) *
                        appliedCoupon.discount) /
                        100
                    )}
                  </p>
                </div>
              )}
              <div className="mb-6">
                <p className="text-yellow-100 text-sm mb-2">Total:</p>
                <p className="text-3xl font-bold text-white">{formatPrice(totalAmount)}</p>
              </div>
              <button
                onClick={handleCheckout}
                disabled={orderItems.length === 0 || !customerEmail}
                className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-400 text-yellow-700 font-bold py-3 rounded-lg transition font-lg"
              >
                Send Checkout Link
              </button>
              <p className="text-xs text-yellow-900 text-center mt-2">
                Customer will receive PayPal checkout link via email
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

