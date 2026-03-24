"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Select, Input } from "@/components/ui";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@prisma/client";

interface ProductFiltersProps {
  categories: (Category & { _count: { products: number } })[];
  sizes: string[];
  currentFilters: {
    category?: string;
    condition?: string;
    gender?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    sort?: string;
    search?: string;
  };
}

export function ProductFilters({
  categories,
  sizes,
  currentFilters,
}: ProductFiltersProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(currentFilters.search || "");

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams();

    // Keep existing params
    Object.entries(currentFilters).forEach(([k, v]) => {
      if (v && k !== key) params.set(k, v);
    });

    // Set new value
    if (value) {
      params.set(key, value);
    }

    router.push(`/shop?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/shop");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilter("search", search || null);
  }

  const hasActiveFilters =
    currentFilters.category ||
    currentFilters.condition ||
    currentFilters.gender ||
    currentFilters.minPrice ||
    currentFilters.maxPrice ||
    currentFilters.size ||
    currentFilters.search;

  return (
    <div>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center gap-2 w-full p-3 bg-cream-100 border border-cream-200 mb-4"
      >
        <SlidersHorizontal className="w-5 h-5" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="ml-auto px-2 py-0.5 bg-espresso-900 text-cream-50 text-xs rounded-full">
            Active
          </span>
        )}
      </button>

      {/* Filters container */}
      <div className={`space-y-6 ${isOpen ? "block" : "hidden lg:block"}`}>
        {/* Search */}
        <div>
          <h3 className="font-medium text-espresso-900 mb-3">Search</h3>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" variant="secondary">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Sort */}
        <div>
          <h3 className="font-medium text-espresso-900 mb-3">Sort by</h3>
          <Select
            value={currentFilters.sort || "newest"}
            onChange={(e) => updateFilter("sort", e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </Select>
        </div>

        {/* Gender */}
        <div>
          <h3 className="font-medium text-espresso-900 mb-3">Gender</h3>
          <div className="space-y-2">
            <button
              onClick={() => updateFilter("gender", null)}
              className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                !currentFilters.gender
                  ? "bg-espresso-900 text-cream-50"
                  : "text-espresso-700 hover:bg-cream-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => updateFilter("gender", "women")}
              className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                currentFilters.gender === "women"
                  ? "bg-espresso-900 text-cream-50"
                  : "text-espresso-700 hover:bg-cream-100"
              }`}
            >
              Women
            </button>
            <button
              onClick={() => updateFilter("gender", "men")}
              className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                currentFilters.gender === "men"
                  ? "bg-espresso-900 text-cream-50"
                  : "text-espresso-700 hover:bg-cream-100"
              }`}
            >
              Men
            </button>
            <button
              onClick={() => updateFilter("gender", "unisex")}
              className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                currentFilters.gender === "unisex"
                  ? "bg-espresso-900 text-cream-50"
                  : "text-espresso-700 hover:bg-cream-100"
              }`}
            >
              Unisex
            </button>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-medium text-espresso-900 mb-3">Category</h3>
          <div className="space-y-2">
            <button
              onClick={() => updateFilter("category", null)}
              className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                !currentFilters.category
                  ? "bg-espresso-900 text-cream-50"
                  : "text-espresso-700 hover:bg-cream-100"
              }`}
            >
              All Categories
            </button>
            {categories
              .filter((c) => c._count.products > 0)
              .map((category) => (
                <button
                  key={category.id}
                  onClick={() => updateFilter("category", category.slug)}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    currentFilters.category === category.slug
                      ? "bg-espresso-900 text-cream-50"
                      : "text-espresso-700 hover:bg-cream-100"
                  }`}
                >
                  {category.name}
                  <span className="text-espresso-400 ml-1">
                    ({category._count.products})
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Condition */}
        <div>
          <h3 className="font-medium text-espresso-900 mb-3">Condition</h3>
          <Select
            value={currentFilters.condition || ""}
            onChange={(e) => updateFilter("condition", e.target.value || null)}
          >
            <option value="">All conditions</option>
            <option value="like_new">Like New</option>
            <option value="very_good">Very Good</option>
            <option value="good">Good</option>
          </Select>
        </div>

        {/* Size */}
        {sizes.length > 0 && (
          <div>
            <h3 className="font-medium text-espresso-900 mb-3">Size</h3>
            <Select
              value={currentFilters.size || ""}
              onChange={(e) => updateFilter("size", e.target.value || null)}
            >
              <option value="">All sizes</option>
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Price range */}
        <div>
          <h3 className="font-medium text-espresso-900 mb-3">Price (PLN)</h3>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={currentFilters.minPrice || ""}
              onChange={(e) => updateFilter("minPrice", e.target.value || null)}
              className="w-full"
            />
            <span className="text-espresso-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={currentFilters.maxPrice || ""}
              onChange={(e) => updateFilter("maxPrice", e.target.value || null)}
              className="w-full"
            />
          </div>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="w-full justify-center"
          >
            <X className="w-4 h-4 mr-2" />
            Clear all filters
          </Button>
        )}
      </div>
    </div>
  );
}
