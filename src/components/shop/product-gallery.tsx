"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import type { ProductImage } from "@prisma/client";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-cream-200 flex items-center justify-center">
        <Package className="w-16 h-16 text-espresso-300" />
      </div>
    );
  }

  function nextImage() {
    setActiveIndex((prev) => (prev + 1) % images.length);
  }

  function prevImage() {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square bg-cream-100 overflow-hidden">
        <Image
          src={images[activeIndex].url}
          alt={`${productName} - Image ${activeIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-cream-50/80 hover:bg-cream-50 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cream-50/80 hover:bg-cream-50 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-espresso-900/70 text-cream-50 text-sm">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(index)}
              className={`relative w-20 h-20 flex-shrink-0 overflow-hidden border-2 transition-colors ${
                index === activeIndex
                  ? "border-espresso-900"
                  : "border-transparent hover:border-cream-400"
              }`}
            >
              <Image
                src={image.url}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
