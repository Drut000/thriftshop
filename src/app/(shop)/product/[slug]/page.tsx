import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, formatCondition, formatGender } from "@/lib/utils";
import { ProductGallery } from "@/components/shop/product-gallery";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { ProductCard } from "@/components/shop/product-card";
import { Badge } from "@/components/ui";
import { ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: { position: "asc" },
      },
    },
  });
}

async function getRelatedProducts(categoryId: string, excludeId: string) {
  return db.product.findMany({
    where: {
      categoryId,
      status: "available",
      id: { not: excludeId },
    },
    take: 4,
    include: {
      images: {
        orderBy: { position: "asc" },
        take: 1,
      },
      category: true,
    },
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  const isSold = product.status === "sold";
  const hasDiscount = product.oldPrice && Number(product.oldPrice) > Number(product.price);

  return (
    <div className="container-page py-8">
      {/* Back link */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-espresso-600 hover:text-espresso-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category & Status */}
          <div className="flex items-center gap-2">
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="text-sm text-espresso-500 hover:text-espresso-700 uppercase tracking-wide"
            >
              {product.category.name}
            </Link>
            {isSold && (
              <Badge className="bg-espresso-900 text-cream-50">Sold</Badge>
            )}
            {hasDiscount && !isSold && (
              <Badge variant="danger">Sale</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-display-sm md:text-display-md text-espresso-900">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl text-espresso-900">
              {formatPrice(Number(product.price))}
            </span>
            {hasDiscount && (
              <span className="text-xl text-espresso-400 line-through">
                {formatPrice(Number(product.oldPrice))}
              </span>
            )}
          </div>

          {/* Quick details */}
          <div className="flex flex-wrap gap-4 py-4 border-y border-cream-200">
            {product.size && (
              <div>
                <span className="text-sm text-espresso-500">Size</span>
                <p className="font-medium text-espresso-900">{product.size}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-espresso-500">Gender</span>
              <p className="font-medium text-espresso-900">
                {formatGender(product.gender)}
              </p>
            </div>
            <div>
              <span className="text-sm text-espresso-500">Condition</span>
              <p className="font-medium text-espresso-900">
                {formatCondition(product.condition)}
              </p>
            </div>
            {product.brand && (
              <div>
                <span className="text-sm text-espresso-500">Brand</span>
                <p className="font-medium text-espresso-900">{product.brand}</p>
              </div>
            )}
            {product.color && (
              <div>
                <span className="text-sm text-espresso-500">Color</span>
                <p className="font-medium text-espresso-900">{product.color}</p>
              </div>
            )}
            {product.material && (
              <div>
                <span className="text-sm text-espresso-500">Material</span>
                <p className="font-medium text-espresso-900">{product.material}</p>
              </div>
            )}
          </div>

          {/* Add to cart */}
          {!isSold ? (
            <AddToCartButton
              product={{
                productId: product.id,
                name: product.name,
                price: Number(product.price),
                size: product.size,
                imageUrl: product.images[0]?.url || null,
              }}
            />
          ) : (
            <div className="p-4 bg-cream-200 text-center">
              <p className="font-medium text-espresso-700">
                This item has been sold
              </p>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="text-sm text-espresso-500 hover:text-espresso-700 underline"
              >
                Browse similar items
              </Link>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="font-medium text-espresso-900 mb-2">Description</h2>
              <p className="text-espresso-600 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-cream-200">
            <div className="text-center">
              <Truck className="w-6 h-6 mx-auto text-espresso-500 mb-1" />
              <p className="text-xs text-espresso-600">Fast Shipping</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 mx-auto text-espresso-500 mb-1" />
              <p className="text-xs text-espresso-600">Secure Payment</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-6 h-6 mx-auto text-espresso-500 mb-1" />
              <p className="text-xs text-espresso-600">Easy Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-16 border-t border-cream-200">
          <h2 className="font-display text-display-sm text-espresso-900 mb-8">
            You might also like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
