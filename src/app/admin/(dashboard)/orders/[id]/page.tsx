import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui";
import { formatPrice, formatOrderStatus, getStatusColor } from "@/lib/utils";
import { ArrowLeft, Package, Mail, Phone, MapPin, Truck } from "lucide-react";
import { OrderStatusForm } from "@/components/admin/order-status-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getOrder(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const shippingAddress = order.shippingAddress as {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-espresso-600 hover:text-espresso-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to orders
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-espresso-900">
              Order {order.orderNumber}
            </h1>
            <p className="text-espresso-500">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <Badge className={`${getStatusColor(order.status)} text-sm px-4 py-2`}>
            {formatOrderStatus(order.status)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-cream-50 border border-cream-200 p-6">
            <h2 className="font-display text-lg text-espresso-900 mb-4">
              Items ({order.items.length})
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-cream-200 last:border-0 last:pb-0"
                >
                  <div className="relative w-20 h-20 bg-cream-200 flex-shrink-0">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-espresso-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <Link
                      href={`/admin/products/${item.product.id}`}
                      className="font-medium text-espresso-900 hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    {item.product.size && (
                      <p className="text-sm text-espresso-500">
                        Size: {item.product.size}
                      </p>
                    )}
                    {item.product.brand && (
                      <p className="text-sm text-espresso-500">
                        Brand: {item.product.brand}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-espresso-900">
                      {formatPrice(Number(item.price))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-cream-300 space-y-2">
              <div className="flex justify-between text-espresso-600">
                <span>Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-espresso-600">
                <span>Shipping ({order.shippingMethod})</span>
                <span>{formatPrice(Number(order.shippingCost))}</span>
              </div>
              <div className="flex justify-between font-medium text-espresso-900 text-lg pt-2 border-t border-cream-300">
                <span>Total</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-cream-50 border border-cream-200 p-6">
            <h2 className="font-display text-lg text-espresso-900 mb-4">
              Update Status
            </h2>
            <OrderStatusForm
              orderId={order.id}
              currentStatus={order.status}
              currentTracking={order.shippingTracking}
              customerEmail={order.customerEmail}
              customerName={order.customerName}
              orderNumber={order.orderNumber}
              shippingMethod={order.shippingMethod}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-cream-50 border border-cream-200 p-6">
            <h2 className="font-display text-lg text-espresso-900 mb-4">
              Customer
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-espresso-400 mt-0.5" />
                <div>
                  <p className="font-medium text-espresso-900">
                    {order.customerName}
                  </p>
                  <a
                    href={`mailto:${order.customerEmail}`}
                    className="text-sm text-espresso-600 hover:underline"
                  >
                    {order.customerEmail}
                  </a>
                </div>
              </div>

              {order.customerPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-espresso-400" />
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="text-espresso-600 hover:underline"
                  >
                    {order.customerPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-cream-50 border border-cream-200 p-6">
            <h2 className="font-display text-lg text-espresso-900 mb-4">
              Shipping Address
            </h2>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-espresso-400 mt-0.5" />
              <div className="text-espresso-700">
                <p>{shippingAddress.street}</p>
                <p>
                  {shippingAddress.postalCode} {shippingAddress.city}
                </p>
                <p>{shippingAddress.country === "PL" ? "Poland" : shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-cream-50 border border-cream-200 p-6">
            <h2 className="font-display text-lg text-espresso-900 mb-4">
              Shipping
            </h2>

            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-espresso-400 mt-0.5" />
              <div>
                <p className="font-medium text-espresso-900">
                  {order.shippingMethod}
                </p>
                <p className="text-sm text-espresso-500">
                  {formatPrice(Number(order.shippingCost))}
                </p>
                {order.shippingTracking && (
                  <p className="mt-2 text-sm">
                    <span className="text-espresso-500">Tracking: </span>
                    <span className="font-mono text-espresso-900">
                      {order.shippingTracking}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-cream-50 border border-cream-200 p-6">
            <h2 className="font-display text-lg text-espresso-900 mb-4">
              Payment
            </h2>

            <div className="space-y-2 text-sm">
              {order.stripePaymentIntentId && (
                <div>
                  <span className="text-espresso-500">Payment ID: </span>
                  <span className="font-mono text-espresso-700 text-xs">
                    {order.stripePaymentIntentId}
                  </span>
                </div>
              )}
              {order.stripeSessionId && (
                <div>
                  <span className="text-espresso-500">Session: </span>
                  <span className="font-mono text-espresso-700 text-xs break-all">
                    {order.stripeSessionId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
