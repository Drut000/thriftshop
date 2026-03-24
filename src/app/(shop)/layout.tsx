import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CartButton } from "@/components/shop/cart-button";
import { db } from "@/lib/db";

async function getCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cream-50 border-b border-cream-200">
        <div className="container-page">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="font-display text-2xl md:text-3xl text-espresso-900">
              Thrift Store
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/shop?gender=women"
                className="text-espresso-600 hover:text-espresso-900 transition-colors font-medium"
              >
                Women
              </Link>
              <Link
                href="/shop?gender=men"
                className="text-espresso-600 hover:text-espresso-900 transition-colors font-medium"
              >
                Men
              </Link>
              <Link
                href="/shop"
                className="text-espresso-600 hover:text-espresso-900 transition-colors"
              >
                Shop All
              </Link>
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="text-espresso-600 hover:text-espresso-900 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            {/* Cart */}
            <CartButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden border-t border-cream-200 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-6 px-4 py-3">
            <Link
              href="/shop?gender=women"
              className="text-sm text-espresso-600 hover:text-espresso-900 whitespace-nowrap font-medium"
            >
              Women
            </Link>
            <Link
              href="/shop?gender=men"
              className="text-sm text-espresso-600 hover:text-espresso-900 whitespace-nowrap font-medium"
            >
              Men
            </Link>
            <Link
              href="/shop"
              className="text-sm text-espresso-600 hover:text-espresso-900 whitespace-nowrap"
            >
              Shop All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="text-sm text-espresso-600 hover:text-espresso-900 whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-espresso-950 text-cream-100">
        <div className="container-page py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="font-display text-2xl mb-4">Thrift Store</h3>
              <p className="text-cream-400 max-w-md">
                Curated vintage and secondhand fashion. Every piece is unique,
                carefully selected from the best thrift finds.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-medium mb-4">Shop</h4>
              <ul className="space-y-2 text-cream-400">
                <li>
                  <Link href="/shop" className="hover:text-cream-100 transition-colors">
                    All Products
                  </Link>
                </li>
                {categories.slice(0, 4).map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/shop?category=${category.slug}`}
                      className="hover:text-cream-100 transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="font-medium mb-4">Info</h4>
              <ul className="space-y-2 text-cream-400">
                <li>
                  <Link href="/about" className="hover:text-cream-100 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-cream-100 transition-colors">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-cream-100 transition-colors">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-cream-100 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 pt-8 border-t border-espresso-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-cream-500">
            <p>© {new Date().getFullYear()} Thrift Store. All rights reserved.</p>
            <p>Made with ♥ for vintage lovers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
