"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button, Input, Textarea, Select, Label } from "@/components/ui";
import { slugify } from "@/lib/utils";
import {
  Upload,
  X,
  GripVertical,
  Loader2,
  ImageIcon,
} from "lucide-react";
import type { Category } from "@prisma/client";
import type { ProductFull } from "@/types";

interface ProductFormProps {
  product?: ProductFull;
  categories: Category[];
}

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  isNew?: boolean;
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  // Form state
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [oldPrice, setOldPrice] = useState(product?.oldPrice?.toString() || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");
  const [size, setSize] = useState(product?.size || "");
  const [condition, setCondition] = useState(product?.condition || "very_good");
  const [gender, setGender] = useState(product?.gender || "unisex");
  const [brand, setBrand] = useState(product?.brand || "");
  const [color, setColor] = useState(product?.color || "");
  const [material, setMaterial] = useState(product?.material || "");
  const [status, setStatus] = useState(product?.status || "available");

  // Images state
  const [images, setImages] = useState<ImageItem[]>(
    product?.images?.map((img) => ({ id: img.id, url: img.url })) || []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  // Image upload
  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setIsUploading(true);

      try {
        const newImages: ImageItem[] = [];

        for (const file of Array.from(files)) {
          // Validate file
          if (!file.type.startsWith("image/")) {
            toast.error(`${file.name} is not an image`);
            continue;
          }

          if (file.size > 5 * 1024 * 1024) {
            toast.error(`${file.name} is too large (max 5MB)`);
            continue;
          }

          // Create preview URL
          const previewUrl = URL.createObjectURL(file);
          newImages.push({
            id: `new-${Date.now()}-${Math.random()}`,
            url: previewUrl,
            file,
            isNew: true,
          });
        }

        setImages((prev) => [...prev, ...newImages]);
      } catch (error) {
        toast.error("Failed to process images");
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  // Drag and drop for reordering
  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    setImages(newImages);
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  // Submit form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // First upload any new images
      const uploadedImageUrls: string[] = [];

      for (const img of images) {
        if (img.isNew && img.file) {
          // Upload to Supabase Storage via our API
          const formData = new FormData();
          formData.append("file", img.file);

          const uploadRes = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) {
            throw new Error("Failed to upload image");
          }

          const { url } = await uploadRes.json();
          uploadedImageUrls.push(url);
        } else {
          uploadedImageUrls.push(img.url);
        }
      }

      // Create/update product
      const productData = {
        name,
        slug,
        description,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        categoryId,
        size,
        condition,
        gender,
        brand: brand || null,
        color: color || null,
        material: material || null,
        status,
        images: uploadedImageUrls,
      };

      const url = isEditing
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";

      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
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

      toast.success(isEditing ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save product"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="bg-cream-50 border border-cream-200 p-6 space-y-4">
            <h2 className="font-display text-lg text-espresso-900">
              Basic Information
            </h2>

            <div>
              <Label htmlFor="name" required>
                Product Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Vintage Levi's Denim Jacket"
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
                placeholder="e.g., vintage-levis-denim-jacket"
                error={!!errors.slug}
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-rust-600">{errors.slug}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the product, its condition, measurements, history..."
                rows={5}
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-cream-50 border border-cream-200 p-6 space-y-4">
            <h2 className="font-display text-lg text-espresso-900">Images</h2>
            <p className="text-sm text-espresso-500">
              Drag to reorder. First image is the main photo.
            </p>

            {/* Image grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative aspect-square bg-cream-200 group cursor-move ${
                    draggedIndex === index ? "opacity-50" : ""
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-espresso-900/0 group-hover:bg-espresso-900/40 transition-colors">
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-5 h-5 text-cream-50" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 p-1 bg-rust-600 text-cream-50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rust-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Main badge */}
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-espresso-900 text-cream-50 text-xs">
                      Main
                    </div>
                  )}
                </div>
              ))}

              {/* Upload button */}
              <label
                className={`relative aspect-square border-2 border-dashed border-cream-300 flex flex-col items-center justify-center cursor-pointer hover:border-espresso-400 transition-colors ${
                  isUploading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="sr-only"
                />
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-espresso-400 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-espresso-400" />
                    <span className="text-sm text-espresso-500 mt-2">
                      Add images
                    </span>
                  </>
                )}
              </label>
            </div>

            {images.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-espresso-500">
                <ImageIcon className="w-4 h-4" />
                No images yet. Add at least one photo.
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-cream-50 border border-cream-200 p-6 space-y-4">
            <h2 className="font-display text-lg text-espresso-900">Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Levi's"
                />
              </div>

              <div>
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g., M, L, 42"
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g., Blue, Black"
                />
              </div>

              <div>
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="e.g., 100% Cotton"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Category */}
          <div className="bg-cream-50 border border-cream-200 p-6 space-y-4">
            <h2 className="font-display text-lg text-espresso-900">
              Organization
            </h2>

            <div>
              <Label htmlFor="status" required>
                Status
              </Label>
              <Select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="reserved">Reserved</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="category" required>
                Category
              </Label>
              <Select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                error={!!errors.categoryId}
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-rust-600">{errors.categoryId}</p>
              )}
            </div>

            <div>
              <Label htmlFor="condition" required>
                Condition
              </Label>
              <Select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="like_new">Like New</option>
                <option value="very_good">Very Good</option>
                <option value="good">Good</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="gender" required>
                Gender
              </Label>
              <Select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </Select>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-cream-50 border border-cream-200 p-6 space-y-4">
            <h2 className="font-display text-lg text-espresso-900">Pricing</h2>

            <div>
              <Label htmlFor="price" required>
                Price (PLN)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                error={!!errors.price}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-rust-600">{errors.price}</p>
              )}
            </div>

            <div>
              <Label htmlFor="oldPrice">
                Compare at Price (PLN)
              </Label>
              <Input
                id="oldPrice"
                type="number"
                step="0.01"
                min="0"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                placeholder="0.00"
              />
              <p className="mt-1 text-sm text-espresso-500">
                Original price before discount (optional)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-cream-200">
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Save Changes" : "Create Product"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
