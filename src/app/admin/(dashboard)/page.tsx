import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Package, FolderTree, ShoppingCart, TrendingUp } from "lucide-react";

async function getStats() {
  const [productsCount, categoriesCount, ordersCount, recentOrders] =
    await Promise.all([
      db.product.count({ where: { status: "available" } }),
      db.category.count(),
      db.order.count({ where: { status: { not: "cancelled" } } }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
    ]);

  // Calculate total revenue
  const paidOrders = await db.order.findMany({
    where: { status: { in: ["paid", "shipped", "delivered"] } },
    select: { total: true },
  });

  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );

  return {
    productsCount,
    categoriesCount,
    ordersCount,
    recentOrders,
    totalRevenue,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    {
      title: "Active Products",
      value: stats.productsCount,
      icon: Package,
      href: "/admin/products",
      color: "bg-sage-100 text-sage-700",
    },
    {
      title: "Categories",
      value: stats.categoriesCount,
      icon: FolderTree,
      href: "/admin/categories",
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Total Orders",
      value: stats.ordersCount,
      icon: ShoppingCart,
      href: "/admin/orders",
      color: "bg-rust-100 text-rust-700",
    },
    {
      title: "Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: TrendingUp,
      href: "/admin/orders",
      color: "bg-espresso-100 text-espresso-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-cream-50 border border-cream-200 p-6 hover:border-cream-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-espresso-500">{stat.title}</p>
                <p className="text-2xl font-display text-espresso-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-cream-50 border border-cream-200">
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
          <h2 className="font-display text-lg text-espresso-900">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm text-espresso-600 hover:text-espresso-900"
          >
            View all →
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-espresso-500">
            No orders yet. They will appear here once customers start buying.
          </div>
        ) : (
          <div className="divide-y divide-cream-200">
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-cream-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-espresso-900">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-espresso-500">
                    {order.customerName} · {order.items.length} item
                    {order.items.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-espresso-900">
                    {formatPrice(Number(order.total))}
                  </p>
                  <p className="text-sm text-espresso-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/products/new"
          className="flex items-center gap-4 p-6 bg-espresso-900 text-cream-50 hover:bg-espresso-800 transition-colors"
        >
          <Package className="w-8 h-8" />
          <div>
            <p className="font-medium">Add New Product</p>
            <p className="text-sm text-cream-300">
              List a new item for sale
            </p>
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="flex items-center gap-4 p-6 bg-cream-50 border border-cream-200 hover:border-cream-300 transition-colors"
        >
          <FolderTree className="w-8 h-8 text-espresso-600" />
          <div>
            <p className="font-medium text-espresso-900">Manage Categories</p>
            <p className="text-sm text-espresso-500">
              Organize your inventory
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
