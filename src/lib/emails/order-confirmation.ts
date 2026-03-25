interface OrderItem {
  name: string;
  size: string | null;
  price: number;
}

interface OrderConfirmationProps {
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

function formatPrice(price: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
}

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  shippingCost,
  shippingMethod,
  total,
  shippingAddress,
}: OrderConfirmationProps): string {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e0db;">
          <strong style="color: #2c2420;">${item.name}</strong>
          ${item.size ? `<br><span style="color: #6b5c4d; font-size: 14px;">Size: ${item.size}</span>` : ""}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e0db; text-align: right; color: #2c2420;">
          ${formatPrice(item.price)}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf9f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e5e0db;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e0db;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #2c2420;">Thank you for your order!</h1>
              <p style="margin: 16px 0 0; color: #6b5c4d; font-size: 16px;">
                Hi ${customerName}, we've received your order and it's being prepared.
              </p>
            </td>
          </tr>
          
          <!-- Order Number -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f3f0; text-align: center;">
              <p style="margin: 0; color: #6b5c4d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
              <p style="margin: 8px 0 0; font-size: 24px; font-weight: 600; color: #2c2420;">${orderNumber}</p>
            </td>
          </tr>
          
          <!-- Items -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 20px; font-size: 18px; color: #2c2420;">Order Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
              
              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #6b5c4d;">Subtotal</td>
                  <td style="padding: 8px 0; text-align: right; color: #2c2420;">${formatPrice(subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b5c4d;">Shipping (${shippingMethod})</td>
                  <td style="padding: 8px 0; text-align: right; color: #2c2420;">${formatPrice(shippingCost)}</td>
                </tr>
                <tr>
                  <td style="padding: 16px 0 0; font-size: 18px; font-weight: 600; color: #2c2420; border-top: 2px solid #2c2420;">Total</td>
                  <td style="padding: 16px 0 0; text-align: right; font-size: 18px; font-weight: 600; color: #2c2420; border-top: 2px solid #2c2420;">${formatPrice(total)}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #2c2420;">Shipping Address</h2>
              <p style="margin: 0; color: #6b5c4d; line-height: 1.6;">
                ${shippingAddress.street}<br>
                ${shippingAddress.postalCode} ${shippingAddress.city}<br>
                ${shippingAddress.country === "PL" ? "Poland" : shippingAddress.country}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #2c2420; text-align: center;">
              <p style="margin: 0; color: #a69b8f; font-size: 14px;">
                Questions? Reply to this email or contact us.
              </p>
              <p style="margin: 16px 0 0; color: #6b5c4d; font-size: 12px;">
                © ${new Date().getFullYear()} Thrift Store. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
