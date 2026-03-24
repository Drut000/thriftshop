import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validators";
import { createServerClient, PRODUCT_IMAGES_BUCKET } from "@/lib/db/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single product
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PATCH update product
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { images, ...productData } = body;

    // Check if product exists
    const existing = await db.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // If only updating status (quick action)
    if (Object.keys(productData).length === 1 && productData.status) {
      const product = await db.product.update({
        where: { id },
        data: { status: productData.status },
      });
      return NextResponse.json(product);
    }

    // Validate input for full update
    const result = productSchema.safeParse(productData);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Check if new slug conflicts with another product
    if (result.data.slug !== existing.slug) {
      const slugConflict = await db.product.findUnique({
        where: { slug: result.data.slug },
      });

      if (slugConflict) {
        return NextResponse.json(
          { errors: [{ field: "slug", message: "This slug is already taken" }] },
          { status: 400 }
        );
      }
    }

    // Update product
    const product = await db.$transaction(async (tx) => {
      // Delete old images if new ones provided
      if (images) {
        await tx.productImage.deleteMany({
          where: { productId: id },
        });
      }

      // Extract categoryId for relation connect
      const { categoryId, ...updateData } = result.data;

      // Update product
      return tx.product.update({
        where: { id },
        data: {
          ...updateData,
          category: {
            connect: { id: categoryId },
          },
          ...(images && {
            images: {
              create: (images as string[]).map((url, index) => ({
                url,
                position: index,
              })),
            },
          }),
        },
        include: {
          category: true,
          images: true,
        },
      });
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get product with images
    const product = await db.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete images from Supabase Storage
    if (product.images.length > 0) {
      const supabase = createServerClient();
      const filePaths = product.images
        .map((img) => {
          // Extract file path from URL
          const url = new URL(img.url);
          const pathMatch = url.pathname.match(
            /\/storage\/v1\/object\/public\/[^/]+\/(.+)/
          );
          return pathMatch ? pathMatch[1] : null;
        })
        .filter(Boolean) as string[];

      if (filePaths.length > 0) {
        await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(filePaths);
      }
    }

    // Delete product (images cascade delete via Prisma)
    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
