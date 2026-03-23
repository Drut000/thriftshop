import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { productIds } = await request.json();

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: "Product IDs are required" },
        { status: 400 }
      );
    }

    // Check which products are still available
    const availableProducts = await db.product.findMany({
      where: {
        id: { in: productIds },
        status: "available",
      },
      select: { id: true },
    });

    const availableIds = new Set(availableProducts.map((p) => p.id));
    const unavailable = productIds.filter((id: string) => !availableIds.has(id));

    return NextResponse.json({
      available: Array.from(availableIds),
      unavailable,
    });
  } catch (error) {
    console.error("Cart validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate cart" },
      { status: 500 }
    );
  }
}
