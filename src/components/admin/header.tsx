"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "Add Product",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/shipping": "Shipping",
  "/admin/settings": "Settings",
};

export function AdminHeader() {
  const pathname = usePathname();

  // Get title for current path
  const getTitle = () => {
    // Check for exact match first
    if (pageTitles[pathname]) {
      return pageTitles[pathname];
    }

    // Check for edit pages
    if (pathname.includes("/products/") && pathname !== "/admin/products/new") {
      return "Edit Product";
    }

    if (pathname.includes("/categories/")) {
      return "Edit Category";
    }

    if (pathname.includes("/orders/")) {
      return "Order Details";
    }

    // Fallback: extract from path
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
      : "Admin";
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-50 border-b border-cream-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Mobile menu button (placeholder) */}
        <button className="lg:hidden p-2 -ml-2 text-espresso-600 hover:text-espresso-900">
          <Menu className="w-6 h-6" />
        </button>

        {/* Page title */}
        <h1 className="text-xl font-display text-espresso-900">{getTitle()}</h1>

        {/* Right side - can add notifications, user menu etc */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-espresso-500">
            <span className="w-2 h-2 bg-sage-500 rounded-full" />
            Online
          </div>
        </div>
      </div>
    </header>
  );
}
