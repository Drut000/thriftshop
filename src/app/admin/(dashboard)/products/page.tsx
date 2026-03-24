import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Button, Badge } from "@/components/ui";
import { formatPrice, formatCondition, getStatusColor } from "@/lib/utils";
import { ProductActions } from "@/components/admin/product-actions";
import { Plus, Package } from "lucide-react";

async function getProducts() {
  return db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: {
        orderBy: { position: "asc" },
        take: 1,
      },
    },
  });
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-espresso-600">
          {products.length} product{products.length !== 1 ? "s" : ""}
        </p>
        <Link href="/admin/products/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Products list */}
      {products.length === 0 ? (
        <div className="bg-cream-50 border border-cream-200 px-6 py-12 text-center">
          <Package className="w-12 h-12 mx-auto text-espresso-300 mb-4" />
          <p className="text-espresso-500 mb-4">No products yet</p>
          <Link href="/admin/products/new">
            <Button>Add your first product</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-cream-50 border border-cream-200">
          {/* Table header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-cream-100 border-b border-cream-200 text-sm font-medium text-espresso-600">
            <div className="col-span-5">Product</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1">Size</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1"></div>
          </div>

          {/* Products */}
          <div className="divide-y divide-cream-200">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-cream-100 transition-colors"
              >
                {/* Product info */}
                <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                  <div className="relative w-16 h-16 bg-cream-200 flex-shrink-0">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-espresso-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium text-espresso-900 hover:text-espresso-700 truncate block"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-espresso-500 truncate">
                      {product.brand || "No brand"} · {formatCondition(product.condition)}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-1 md:col-span-2">
                  <span className="md:hidden text-sm text-espresso-500 mr-2">
                    Category:
                  </span>
                  <span className="text-espresso-700">{product.category.name}</span>
                </div>

                {/* Size */}
                <div className="col-span-1 md:col-span-1">
                  <span className="md:hidden text-sm text-espresso-500 mr-2">
                    Size:
                  </span>
                  <span className="text-espresso-700">{product.size || "-"}</span>
                </div>

                {/* Price */}
                <div className="col-span-1 md:col-span-1">
                  <span className="md:hidden text-sm text-espresso-500 mr-2">
                    Price:
                  </span>
                  <span className="font-medium text-espresso-900">
                    {formatPrice(Number(product.price))}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-1 md:col-span-2">
                  <Badge className={getStatusColor(product.status)}>
                    {product.status}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="col-span-1 md:col-span-1 flex justify-end">
                  <ProductActions product={product} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
