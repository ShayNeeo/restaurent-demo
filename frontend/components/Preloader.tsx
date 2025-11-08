"use client";

import { useEffect, useState } from "react";

export function Preloader() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (document.readyState === "complete") {
      setIsReady(true);
      return;
    }

    const handleLoad = () => setIsReady(true);
    window.addEventListener("load", handleLoad);
    const timeout = window.setTimeout(() => setIsReady(true), 2000);

    return () => {
      window.removeEventListener("load", handleLoad);
      window.clearTimeout(timeout);
    };
  }, []);

  if (isReady) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-dark text-white transition-opacity duration-500">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
        <p className="text-sm uppercase tracking-[0.4em] text-yellow-300">
          Nguyen Restaurant
        </p>
      </div>
    </div>
  );
}

