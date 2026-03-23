import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: {
        orderBy: { position: "asc" },
      },
    },
  });
}

async function getCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductForm product={product} categories={categories} />;
}
