import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shippingMethodSchema } from "@/lib/validators";

// POST create new shipping method
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = shippingMethodSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Check if zone exists
    const zone = await db.shippingZone.findUnique({
      where: { id: result.data.zoneId },
    });

    if (!zone) {
      return NextResponse.json(
        { errors: [{ field: "zoneId", message: "Zone not found" }] },
        { status: 400 }
      );
    }

    const method = await db.shippingMethod.create({
      data: result.data,
    });

    return NextResponse.json(method, { status: 201 });
  } catch (error) {
    console.error("Error creating shipping method:", error);
    return NextResponse.json(
      { error: "Failed to create shipping method" },
      { status: 500 }
    );
  }
}
