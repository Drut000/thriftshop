"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useCart, useMounted } from "@/hooks";
import { formatPrice } from "@/lib/utils";
import { Trash2, ShoppingBag, ArrowRight, Package } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const mounted = useMounted();
  const { items, removeItem, clearCart, getTotal } = useCart();
  const [isValidating, setIsValidating] = useState(false);

  // Hydrate cart on mount
  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);

  async function handleCheckout() {
    if (items.length === 0) return;

    setIsValidating(true);

    try {
      // Validate products are still available
      const res = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: items.map((i) => i.productId) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Validation failed");
      }

      if (data.unavailable && data.unavailable.length > 0) {
        // Remove unavailable items from cart
        data.unavailable.forEach((id: string) => removeItem(id));
        alert(
          `Some items are no longer available and have been removed from your cart.`
        );
        return;
      }

      // Proceed to checkout
      router.push("/checkout");
    } catch (error) {
      console.error("Cart validation error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsValidating(false);
    }
  }

  if (!mounted) {
    return (
      <div className="container-page py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-cream-200 rounded" />
          <div className="h-64 bg-cream-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="font-display text-display-sm md:text-display-md text-espresso-900 mb-8">
        Your Cart
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 mx-auto text-espresso-300 mb-4" />
          <p className="text-espresso-500 mb-6">Your cart is empty</p>
          <Link href="/shop">
            <Button>
              Start Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 p-4 bg-cream-50 border border-cream-200"
              >
                {/* Image */}
                <div className="relative w-24 h-24 md:w-32 md:h-32 bg-cream-200 flex-shrink-0">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-espresso-300" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.productId}`}
                    className="font-medium text-espresso-900 hover:text-espresso-700 line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  {item.size && (
                    <p className="text-sm text-espresso-500 mt-1">
                      Size: {item.size}
                    </p>
                  )}
                  <p className="font-display text-lg text-espresso-900 mt-2">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-2 text-espresso-400 hover:text-rust-600 transition-colors self-start"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            {/* Clear cart */}
            <button
              onClick={clearCart}
              className="text-sm text-espresso-500 hover:text-espresso-700 underline"
            >
              Clear cart
            </button>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-cream-100 border border-cream-200 p-6 sticky top-24">
              <h2 className="font-display text-xl text-espresso-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-espresso-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPrice(getTotal())}</span>
                </div>
                <div className="flex justify-between text-espresso-600">
                  <span>Shipping</span>
                  <span className="text-espresso-500">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-cream-300 pt-4 mb-6">
                <div className="flex justify-between font-medium text-espresso-900">
                  <span>Total</span>
                  <span className="font-display text-xl">
                    {formatPrice(getTotal())}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                isLoading={isValidating}
                className="w-full"
                size="lg"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-xs text-espresso-500 text-center mt-4">
                Shipping and taxes calculated at checkout
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
