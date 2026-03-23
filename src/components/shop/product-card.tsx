import Link from "next/link";
import Image from "next/image";
import { formatPrice, formatCondition } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { Package } from "lucide-react";
import type { Product, ProductImage, Category } from "@prisma/client";

interface ProductCardProps {
  product: Product & {
    images: ProductImage[];
    category: Category;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0];
  const hasDiscount = product.oldPrice && Number(product.oldPrice) > Number(product.price);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-cream-200 overflow-hidden mb-3">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-espresso-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <Badge variant="danger" className="text-[10px]">
              Sale
            </Badge>
          )}
          {product.status === "sold" && (
            <Badge className="bg-espresso-900 text-cream-50 text-[10px]">
              Sold
            </Badge>
          )}
        </div>

        {/* Quick info on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-espresso-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-cream-50 text-sm">
            {product.size && `Size ${product.size}`}
            {product.size && product.brand && " · "}
            {product.brand}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <p className="text-xs text-espresso-500 uppercase tracking-wide">
          {product.category.name}
        </p>
        <h3 className="font-medium text-espresso-900 leading-tight group-hover:text-espresso-700 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <p className="font-display text-lg text-espresso-900">
            {formatPrice(Number(product.price))}
          </p>
          {hasDiscount && (
            <p className="text-sm text-espresso-400 line-through">
              {formatPrice(Number(product.oldPrice))}
            </p>
          )}
        </div>
        <p className="text-xs text-espresso-500">
          {formatCondition(product.condition)}
        </p>
      </div>
    </Link>
  );
}
