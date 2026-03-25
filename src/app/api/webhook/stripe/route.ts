import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmation } from "@/lib/emails";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutExpired(session);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.error("No orderId in session metadata");
    return;
  }

  // Get order with items and products
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    console.error(`Order not found: ${orderId}`);
    return;
  }

  // Already processed (idempotency)
  if (order.status === "paid") {
    console.log(`Order ${orderId} already marked as paid`);
    return;
  }

  // Update order status
  await db.order.update({
    where: { id: orderId },
    data: {
      status: "paid",
      stripePaymentIntentId: session.payment_intent as string,
    },
  });

  // Mark products as sold
  const productIds = order.items.map((item) => item.productId);
  await db.product.updateMany({
    where: { id: { in: productIds } },
    data: { status: "sold" },
  });

  console.log(`Order ${order.orderNumber} marked as paid`);

  // Send confirmation email
  try {
    const shippingAddress = order.shippingAddress as {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };

    await sendOrderConfirmation({
      to: order.customerEmail,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      items: order.items.map((item) => ({
        name: item.product.name,
        size: item.product.size,
        price: Number(item.price),
      })),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      shippingMethod: order.shippingMethod,
      total: Number(order.total),
      shippingAddress,
    });

    console.log(`Confirmation email sent to ${order.customerEmail}`);
  } catch (error) {
    // Don't fail the webhook if email fails
    console.error("Failed to send confirmation email:", error);
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.error("No orderId in session metadata");
    return;
  }

  // Get order
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    console.error(`Order not found: ${orderId}`);
    return;
  }

  // Don't cancel if already paid
  if (order.status === "paid") {
    return;
  }

  // Cancel order
  await db.order.update({
    where: { id: orderId },
    data: { status: "cancelled" },
  });

  // Release products (back to available)
  const productIds = order.items.map((item) => item.productId);
  await db.product.updateMany({
    where: { id: { in: productIds } },
    data: { status: "available" },
  });

  console.log(`Order ${order.orderNumber} cancelled (payment expired)`);
}
