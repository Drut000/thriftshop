import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { ClearCartOnSuccess } from "@/components/shop/clear-cart-on-success";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

async function getOrderBySession(sessionId: string) {
  // Get session from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session.metadata?.orderId) {
    return null;
  }

  // Get order from database
  const order = await db.order.findUnique({
    where: { id: session.metadata.orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { position: "asc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  return order;
}

export default async function OrderSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/shop");
  }

  const order = await getOrderBySession(session_id);

  if (!order) {
    redirect("/shop");
  }

  const shippingAddress = order.shippingAddress as {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };

  return (
    <div className="container-page py-12 max-w-2xl mx-auto">
      {/* Clear cart on mount */}
      <ClearCartOnSuccess />

      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="font-display text-display-sm md:text-display-md text-espresso-900 mb-2">
          Thank you for your order!
        </h1>
        <p className="text-espresso-600">
          We've received your order and will process it shortly.
        </p>
      </div>

      {/* Order details */}
      <div className="bg-cream-50 border border-cream-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-cream-200">
          <div>
            <p className="text-sm text-espresso-500">Order number</p>
            <p className="font-medium text-espresso-900 text-lg">
              {order.orderNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-espresso-500">Total</p>
            <p className="font-display text-xl text-espresso-900">
              {formatPrice(Number(order.total))}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-6">
          <h3 className="font-medium text-espresso-900">Items</h3>
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <Package className="w-5 h-5 text-espresso-400" />
              <div className="flex-1">
                <p className="text-espresso-900">{item.product.name}</p>
                {item.product.size && (
                  <p className="text-sm text-espresso-500">
                    Size: {item.product.size}
                  </p>
                )}
              </div>
              <p className="text-espresso-700">
                {formatPrice(Number(item.price))}
              </p>
            </div>
          ))}
        </div>

        {/* Shipping */}
        <div className="pt-4 border-t border-cream-200">
          <h3 className="font-medium text-espresso-900 mb-2">
            Shipping to
          </h3>
          <p className="text-espresso-600">
            {order.customerName}
            <br />
            {shippingAddress.street}
            <br />
            {shippingAddress.postalCode} {shippingAddress.city}
            <br />
            {shippingAddress.country === "PL" ? "Poland" : shippingAddress.country}
          </p>
          <p className="text-sm text-espresso-500 mt-2">
            Shipping method: {order.shippingMethod}
          </p>
        </div>
      </div>

      {/* Confirmation email notice */}
      <div className="bg-sage-50 border border-sage-200 p-4 mb-6 text-center">
        <p className="text-espresso-700">
          A confirmation email has been sent to{" "}
          <span className="font-medium">{order.customerEmail}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="text-center">
        <Link href="/shop">
          <Button>
            Continue Shopping
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
