import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Find order by Stripe session ID
    const order = await db.order.findFirst({
      where: { stripeSessionId: sessionId },
      include: { items: true },
    });

    if (!order) {
      // No order found - might have been already cleaned up
      return NextResponse.json({ success: true });
    }

    // Only cancel if still pending
    if (order.status !== "pending_payment") {
      return NextResponse.json({ success: true });
    }

    // Release products (back to available)
    const productIds = order.items.map((item) => item.productId);
    await db.product.updateMany({
      where: { 
        id: { in: productIds },
        status: "reserved", // Only release if still reserved
      },
      data: { status: "available" },
    });

    // Cancel the order
    await db.order.update({
      where: { id: order.id },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
