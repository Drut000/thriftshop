"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Input, Label } from "@/components/ui";
import { slugify } from "@/lib/utils";
import type { Category } from "@prisma/client";

interface CategoryFormProps {
  category?: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = !!category;

  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [isAutoSlug, setIsAutoSlug] = useState(!isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleNameChange(value: string) {
    setName(value);
    if (isAutoSlug) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setIsAutoSlug(false);
    setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/admin/categories/${category.id}`
        : "/api/admin/categories";

      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const fieldErrors: Record<string, string> = {};
          data.errors.forEach((err: { field: string; message: string }) => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
        } else {
          throw new Error(data.error || "Failed to save");
        }
        return;
      }

      toast.success(isEditing ? "Category updated" : "Category created");
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save category"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div className="bg-cream-50 border border-cream-200 p-6 space-y-4">
        <div>
          <Label htmlFor="name" required>
            Category Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., Jackets"
            error={!!errors.name}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-rust-600">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="slug" required>
            URL Slug
          </Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="e.g., jackets"
            error={!!errors.slug}
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-rust-600">{errors.slug}</p>
          )}
          <p className="mt-1 text-sm text-espresso-500">
            Will appear in URL: /shop/{slug || "..."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Save Changes" : "Create Category"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
