import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shippingZoneSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single shipping zone
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const zone = await db.shippingZone.findUnique({
      where: { id },
      include: {
        methods: {
          orderBy: { price: "asc" },
        },
      },
    });

    if (!zone) {
      return NextResponse.json(
        { error: "Shipping zone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(zone);
  } catch (error) {
    console.error("Error fetching shipping zone:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping zone" },
      { status: 500 }
    );
  }
}

// PATCH update shipping zone
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if zone exists
    const existing = await db.shippingZone.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Shipping zone not found" },
        { status: 404 }
      );
    }

    // Validate input
    const result = shippingZoneSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    const zone = await db.shippingZone.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(zone);
  } catch (error) {
    console.error("Error updating shipping zone:", error);
    return NextResponse.json(
      { error: "Failed to update shipping zone" },
      { status: 500 }
    );
  }
}

// DELETE shipping zone
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if zone exists and has methods
    const zone = await db.shippingZone.findUnique({
      where: { id },
      include: {
        _count: {
          select: { methods: true },
        },
      },
    });

    if (!zone) {
      return NextResponse.json(
        { error: "Shipping zone not found" },
        { status: 404 }
      );
    }

    if (zone._count.methods > 0) {
      return NextResponse.json(
        { error: "Cannot delete zone with shipping methods" },
        { status: 400 }
      );
    }

    await db.shippingZone.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shipping zone:", error);
    return NextResponse.json(
      { error: "Failed to delete shipping zone" },
      { status: 500 }
    );
  }
}
