import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui";
import { CategoryRow } from "@/components/admin/category-row";
import { Plus } from "lucide-react";

async function getCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-espresso-600">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}
        </p>
        <Link href="/admin/categories/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      {/* Categories list */}
      <div className="bg-cream-50 border border-cream-200">
        {categories.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-espresso-500 mb-4">No categories yet</p>
            <Link href="/admin/categories/new">
              <Button>Create your first category</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-cream-200">
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                productCount={category._count.products}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
