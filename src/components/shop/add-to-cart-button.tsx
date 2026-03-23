"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { useCart, useMounted } from "@/hooks";
import { ShoppingBag, Check } from "lucide-react";
import type { CartItem } from "@/types";

interface AddToCartButtonProps {
  product: CartItem;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter();
  const mounted = useMounted();
  const { addItem, isInCart, removeItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const inCart = mounted && isInCart(product.productId);

  // Hydrate cart on mount
  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);

  async function handleAddToCart() {
    if (inCart) {
      // Go to cart if already added
      router.push("/cart");
      return;
    }

    setIsAdding(true);

    // Simulate slight delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    addItem(product);
    toast.success("Added to cart", {
      action: {
        label: "View Cart",
        onClick: () => router.push("/cart"),
      },
    });

    setIsAdding(false);
  }

  return (
    <Button
      onClick={handleAddToCart}
      isLoading={isAdding}
      className="w-full"
      size="lg"
    >
      {inCart ? (
        <>
          <Check className="w-5 h-5 mr-2" />
          In Cart — View Cart
        </>
      ) : (
        <>
          <ShoppingBag className="w-5 h-5 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
