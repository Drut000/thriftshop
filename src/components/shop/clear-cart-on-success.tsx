"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks";

export function ClearCartOnSuccess() {
  const clearCart = useCart((state) => state.clearCart);

  useEffect(() => {
    // Clear cart after successful order
    clearCart();
  }, [clearCart]);

  return null;
}
