"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart, useMounted } from "@/hooks";

export function CartButton() {
  const mounted = useMounted();
  const itemCount = useCart((state) => state.getItemCount());

  return (
    <Link
      href="/cart"
      className="relative p-2 text-espresso-600 hover:text-espresso-900 transition-colors"
    >
      <ShoppingBag className="w-6 h-6" />
      {mounted && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-espresso-900 text-cream-50 text-xs font-medium rounded-full flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
