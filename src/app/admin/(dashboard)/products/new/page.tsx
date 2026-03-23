import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

async function getCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function NewProductPage() {
  const categories = await getCategories();

  return <ProductForm categories={categories} />;
}
