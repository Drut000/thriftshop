import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendShippingNotification } from "@/lib/emails";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single order
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PATCH update order
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      status,
      trackingNumber,
      sendEmail,
      customerEmail,
      customerName,
      orderNumber,
      shippingMethod,
    } = body;

    // Check if order exists
    const existing = await db.order.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order
    const order = await db.order.update({
      where: { id },
      data: {
        status,
        shippingTracking: trackingNumber,
      },
    });

    // Send shipping notification email if requested
    if (sendEmail && status === "shipped" && trackingNumber) {
      try {
        await sendShippingNotification({
          to: customerEmail,
          orderNumber,
          customerName,
          trackingNumber,
          shippingMethod,
        });
        console.log(`Shipping notification sent to ${customerEmail}`);
      } catch (emailError) {
        console.error("Failed to send shipping notification:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
