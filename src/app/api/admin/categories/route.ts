import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validators";

// GET all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = categorySchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { name, slug } = result.data;

    // Check if slug already exists
    const existing = await db.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { errors: [{ field: "slug", message: "This slug is already taken" }] },
        { status: 400 }
      );
    }

    // Create category
    const category = await db.category.create({
      data: { name, slug },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
