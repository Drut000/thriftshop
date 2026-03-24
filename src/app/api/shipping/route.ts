import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const zones = await db.shippingZone.findMany({
      include: {
        methods: {
          where: { active: true },
          orderBy: { price: "asc" },
        },
      },
    });

    // Transform to simpler format
    const result = zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      methods: zone.methods.map((method) => ({
        id: method.id,
        name: method.name,
        description: method.description,
        price: Number(method.price),
        estimatedDays: method.estimatedDays,
      })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching shipping methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping methods" },
      { status: 500 }
    );
  }
}
