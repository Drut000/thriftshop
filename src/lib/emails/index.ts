import { resend, EMAIL_FROM } from "@/lib/resend";
import { OrderConfirmationEmail } from "./order-confirmation";
import { ShippingNotificationEmail } from "./shipping-notification";

interface OrderItem {
  name: string;
  size: string | null;
  price: number;
}

interface SendOrderConfirmationParams {
  to: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  shippingMethod: string;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

interface SendShippingNotificationParams {
  to: string;
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  trackingUrl?: string;
  shippingMethod: string;
}

export async function sendOrderConfirmation(
  params: SendOrderConfirmationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = OrderConfirmationEmail({
      orderNumber: params.orderNumber,
      customerName: params.customerName,
      items: params.items,
      subtotal: params.subtotal,
      shippingCost: params.shippingCost,
      shippingMethod: params.shippingMethod,
      total: params.total,
      shippingAddress: params.shippingAddress,
    });

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: `Order Confirmed - ${params.orderNumber}`,
      html,
    });

    if (error) {
      console.error("Failed to send order confirmation:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending order confirmation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendShippingNotification(
  params: SendShippingNotificationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = ShippingNotificationEmail({
      orderNumber: params.orderNumber,
      customerName: params.customerName,
      trackingNumber: params.trackingNumber,
      trackingUrl: params.trackingUrl,
      shippingMethod: params.shippingMethod,
    });

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: `Your order ${params.orderNumber} has been shipped!`,
      html,
    });

    if (error) {
      console.error("Failed to send shipping notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending shipping notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
