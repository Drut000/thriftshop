import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui";
import { ArrowRight } from "lucide-react";

async function getFeaturedProducts() {
  return db.product.findMany({
    where: { status: "available" },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      images: {
        orderBy: { position: "asc" },
        take: 1,
      },
      category: true,
    },
  });
}

async function getCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: { where: { status: "available" } } },
      },
    },
  });
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-espresso-950 text-cream-50 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container-page relative">
          <div className="py-20 md:py-32 lg:py-40 max-w-3xl">
            <h1 className="font-display text-display-md md:text-display-lg lg:text-display-xl text-balance">
              Unique Vintage Finds,
              <br />
              <span className="text-cream-400">One of a Kind</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-cream-300 max-w-xl">
              Discover curated secondhand fashion. Every piece tells a story,
              and when it's gone, it's gone forever.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop">
                <Button className="bg-cream-50 text-espresso-900 border-cream-50 hover:bg-cream-100 hover:border-cream-100">
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/shop?sort=newest">
                <Button variant="secondary" className="border-cream-50 text-cream-50 hover:bg-cream-50 hover:text-espresso-900">
                  New Arrivals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-20 bg-cream-100">
        <div className="container-page">
          <h2 className="font-display text-display-sm md:text-display-md text-espresso-900 text-center mb-10">
            Shop by Category
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories
              .filter((c) => c._count.products > 0)
              .slice(0, 8)
              .map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group relative bg-cream-50 p-6 md:p-8 text-center border border-cream-200 hover:border-espresso-300 transition-colors"
                >
                  <h3 className="font-display text-lg md:text-xl text-espresso-900 group-hover:text-espresso-700">
                    {category.name}
                  </h3>
                  <p className="text-sm text-espresso-500 mt-1">
                    {category._count.products} items
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-20">
        <div className="container-page">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display text-display-sm md:text-display-md text-espresso-900">
              Latest Arrivals
            </h2>
            <Link
              href="/shop?sort=newest"
              className="text-espresso-600 hover:text-espresso-900 flex items-center gap-2"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-espresso-500">
                No products yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* USP Banner */}
      <section className="py-12 bg-sage-100">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-display text-lg text-espresso-900 mb-2">
                One of a Kind
              </h3>
              <p className="text-espresso-600">
                Every item is unique. When it's sold, it's gone.
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg text-espresso-900 mb-2">
                Sustainable Fashion
              </h3>
              <p className="text-espresso-600">
                Give pre-loved clothes a second life.
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg text-espresso-900 mb-2">
                Curated Selection
              </h3>
              <p className="text-espresso-600">
                Hand-picked vintage from the best thrift finds.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
