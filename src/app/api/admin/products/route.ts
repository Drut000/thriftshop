import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validators";

// GET all products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: {
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { images, ...productData } = body;

    // Validate input
    const result = productSchema.safeParse(productData);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Check if slug already exists
    const existing = await db.product.findUnique({
      where: { slug: result.data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { errors: [{ field: "slug", message: "This slug is already taken" }] },
        { status: 400 }
      );
    }

    // Create product with images
    const product = await db.product.create({
      data: {
        ...result.data,
        images: {
          create: (images as string[]).map((url, index) => ({
            url,
            position: index,
          })),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
