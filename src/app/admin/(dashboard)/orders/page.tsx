import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui";
import { formatPrice, formatOrderStatus, getStatusColor } from "@/lib/utils";
import { ShoppingCart, Package } from "lucide-react";

async function getOrders() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-espresso-600">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="bg-cream-50 border border-cream-200 px-6 py-12 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto text-espresso-300 mb-4" />
          <p className="text-espresso-500 mb-2">No orders yet</p>
          <p className="text-sm text-espresso-400">
            Orders will appear here once customers start buying
          </p>
        </div>
      ) : (
        <div className="bg-cream-50 border border-cream-200 overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-cream-100 border-b border-cream-200 text-sm font-medium text-espresso-600">
            <div className="col-span-2">Order</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Items</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Date</div>
          </div>

          {/* Orders */}
          <div className="divide-y divide-cream-200">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-cream-100 transition-colors"
              >
                {/* Order number */}
                <div className="col-span-1 md:col-span-2">
                  <span className="font-mono text-sm font-medium text-espresso-900">
                    {order.orderNumber}
                  </span>
                </div>

                {/* Customer */}
                <div className="col-span-1 md:col-span-3">
                  <p className="font-medium text-espresso-900">
                    {order.customerName}
                  </p>
                  <p className="text-sm text-espresso-500">{order.customerEmail}</p>
                </div>

                {/* Items */}
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-espresso-400" />
                    <span className="text-espresso-700">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="col-span-1 md:col-span-2">
                  <span className="font-medium text-espresso-900">
                    {formatPrice(Number(order.total))}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-1 md:col-span-2">
                  <Badge className={getStatusColor(order.status)}>
                    {formatOrderStatus(order.status)}
                  </Badge>
                </div>

                {/* Date */}
                <div className="col-span-1 md:col-span-1 text-sm text-espresso-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
