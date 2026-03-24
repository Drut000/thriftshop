import { Suspense } from "react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/shop/product-card";
import { ProductFilters } from "@/components/shop/product-filters";
import { ProductGridSkeleton } from "@/components/ui";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    condition?: string;
    gender?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    sort?: string;
    search?: string;
  }>;
}

async function getProducts(searchParams: Awaited<ShopPageProps["searchParams"]>) {
  const { category, condition, gender, minPrice, maxPrice, size, sort, search } = searchParams;

  const where: Record<string, unknown> = {
    status: "available",
  };

  // Category filter
  if (category) {
    const categoryRecord = await db.category.findUnique({
      where: { slug: category },
    });
    if (categoryRecord) {
      where.categoryId = categoryRecord.id;
    }
  }

  // Gender filter
  if (gender && ["men", "women", "unisex"].includes(gender)) {
    // If filtering by men or women, also include unisex
    if (gender === "men" || gender === "women") {
      where.gender = { in: [gender, "unisex"] };
    } else {
      where.gender = gender;
    }
  }

  // Condition filter
  if (condition && ["like_new", "very_good", "good"].includes(condition)) {
    where.condition = condition;
  }

  // Size filter
  if (size) {
    where.size = size;
  }

  // Price filter
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
    if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
  }

  // Search
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Sorting
  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };

  return db.product.findMany({
    where,
    orderBy,
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

async function getSizes() {
  const sizes = await db.product.findMany({
    where: { status: "available", size: { not: null } },
    select: { size: true },
    distinct: ["size"],
  });
  return sizes.map((s) => s.size).filter(Boolean) as string[];
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [products, categories, sizes] = await Promise.all([
    getProducts(params),
    getCategories(),
    getSizes(),
  ]);

  const activeCategory = categories.find((c) => c.slug === params.category);
  const activeGender = params.gender;
  
  // Build page title
  let pageTitle = "All Products";
  if (activeGender === "men") pageTitle = "Men";
  else if (activeGender === "women") pageTitle = "Women";
  if (activeCategory) pageTitle = activeCategory.name;

  return (
    <div className="container-page py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-display-sm md:text-display-md text-espresso-900">
          {pageTitle}
        </h1>
        <p className="text-espresso-500 mt-2">
          {products.length} item{products.length !== 1 ? "s" : ""} available
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters
            categories={categories}
            sizes={sizes}
            currentFilters={params}
          />
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-espresso-500 mb-4">
                No products found with these filters.
              </p>
              <a
                href="/shop"
                className="text-espresso-900 underline hover:no-underline"
              >
                Clear all filters
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
