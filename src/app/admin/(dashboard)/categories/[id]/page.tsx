import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CategoryForm } from "@/components/admin/category-form";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;

  const category = await db.category.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  return <CategoryForm category={category} />;
}
