import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shippingZoneSchema } from "@/lib/validators";

// GET all shipping zones
export async function GET() {
  try {
    const zones = await db.shippingZone.findMany({
      orderBy: { name: "asc" },
      include: {
        methods: {
          orderBy: { price: "asc" },
        },
      },
    });

    return NextResponse.json(zones);
  } catch (error) {
    console.error("Error fetching shipping zones:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping zones" },
      { status: 500 }
    );
  }
}

// POST create new shipping zone
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = shippingZoneSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    const zone = await db.shippingZone.create({
      data: result.data,
    });

    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    console.error("Error creating shipping zone:", error);
    return NextResponse.json(
      { error: "Failed to create shipping zone" },
      { status: 500 }
    );
  }
}
