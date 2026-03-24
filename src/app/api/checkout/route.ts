import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe, formatAmountForStripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validators";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = checkoutSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    const {
      items,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      shippingMethodId,
    } = body;

    // Validate items exist
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    // Get products and check availability
    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
        status: "available",
      },
      include: {
        images: {
          orderBy: { position: "asc" },
          take: 1,
        },
      },
    });

    // Check if all products are available
    if (products.length !== items.length) {
      const availableIds = new Set(products.map((p) => p.id));
      const unavailable = productIds.filter((id: string) => !availableIds.has(id));
      return NextResponse.json(
        { error: "Some products are no longer available", unavailable },
        { status: 400 }
      );
    }

    // Get shipping method
    const shippingMethod = await db.shippingMethod.findUnique({
      where: { id: shippingMethodId },
    });

    if (!shippingMethod) {
      return NextResponse.json(
        { error: "Invalid shipping method" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = products.reduce((sum, p) => sum + Number(p.price), 0);
    const shippingCost = Number(shippingMethod.price);
    const total = subtotal + shippingCost;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order in database (pending payment)
    const order = await db.order.create({
      data: {
        orderNumber,
        status: "pending_payment",
        customerEmail,
        customerName,
        customerPhone,
        shippingAddress,
        shippingMethod: shippingMethod.name,
        shippingMethodId: shippingMethod.id,
        shippingCost,
        subtotal,
        total,
        items: {
          create: products.map((product) => ({
            productId: product.id,
            price: product.price,
          })),
        },
      },
    });

    // Reserve products (change status to reserved)
    await db.product.updateMany({
      where: { id: { in: productIds } },
      data: { status: "reserved" },
    });

    // Create Stripe Checkout Session
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "pln",
        product_data: {
          name: product.name,
          description: product.size ? `Size: ${product.size}` : undefined,
          images: product.images[0] ? [product.images[0].url] : undefined,
        },
        unit_amount: formatAmountForStripe(Number(product.price)),
      },
      quantity: 1,
    }));

    // Add shipping as line item
    lineItems.push({
      price_data: {
        currency: "pln",
        product_data: {
          name: `Shipping: ${shippingMethod.name}`,
          description: shippingMethod.estimatedDays || undefined,
          images: undefined,
        },
        unit_amount: formatAmountForStripe(shippingCost),
      },
      quantity: 1,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "p24", "blik"],
      line_items: lineItems,
      customer_email: customerEmail,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      success_url: `${appUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?cancelled=true&session_id={CHECKOUT_SESSION_ID}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    // Save Stripe session ID
    await db.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
