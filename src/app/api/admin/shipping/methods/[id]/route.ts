import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shippingMethodSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single shipping method
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const method = await db.shippingMethod.findUnique({
      where: { id },
      include: { zone: true },
    });

    if (!method) {
      return NextResponse.json(
        { error: "Shipping method not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(method);
  } catch (error) {
    console.error("Error fetching shipping method:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping method" },
      { status: 500 }
    );
  }
}

// PATCH update shipping method
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if method exists
    const existing = await db.shippingMethod.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Shipping method not found" },
        { status: 404 }
      );
    }

    // Validate input
    const result = shippingMethodSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    const method = await db.shippingMethod.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(method);
  } catch (error) {
    console.error("Error updating shipping method:", error);
    return NextResponse.json(
      { error: "Failed to update shipping method" },
      { status: 500 }
    );
  }
}

// DELETE shipping method
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const method = await db.shippingMethod.findUnique({
      where: { id },
    });

    if (!method) {
      return NextResponse.json(
        { error: "Shipping method not found" },
        { status: 404 }
      );
    }

    await db.shippingMethod.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shipping method:", error);
    return NextResponse.json(
      { error: "Failed to delete shipping method" },
      { status: 500 }
    );
  }
}
