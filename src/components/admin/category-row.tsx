"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import type { Category } from "@prisma/client";

interface CategoryRowProps {
  category: Category;
  productCount: number;
}

export function CategoryRow({ category, productCount }: CategoryRowProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (productCount > 0) {
      toast.error(
        `Cannot delete category with ${productCount} product${productCount > 1 ? "s" : ""}. Remove products first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("Category deleted");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-cream-100 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-espresso-900">{category.name}</p>
        <p className="text-sm text-espresso-500">
          /{category.slug} · {productCount} product{productCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/admin/categories/${category.id}`}
          className="p-2 text-espresso-500 hover:text-espresso-700 hover:bg-cream-200 rounded transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </Link>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-espresso-500 hover:text-rust-600 hover:bg-rust-50 rounded transition-colors disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
