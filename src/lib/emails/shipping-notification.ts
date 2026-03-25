interface ShippingNotificationProps {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  trackingUrl?: string;
  shippingMethod: string;
}

export function ShippingNotificationEmail({
  orderNumber,
  customerName,
  trackingNumber,
  trackingUrl,
  shippingMethod,
}: ShippingNotificationProps): string {
  // Default tracking URLs for Polish carriers
  const defaultTrackingUrl = shippingMethod.toLowerCase().includes("inpost")
    ? `https://inpost.pl/sledzenie-przesylek?number=${trackingNumber}`
    : shippingMethod.toLowerCase().includes("dhl")
    ? `https://www.dhl.pl/pl/express/sledzenie_przesylki.html?AWB=${trackingNumber}`
    : trackingUrl;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your order has been shipped!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf9f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e5e0db;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e0db;">
              <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #2c2420;">Your order is on its way!</h1>
              <p style="margin: 16px 0 0; color: #6b5c4d; font-size: 16px;">
                Hi ${customerName}, great news! Your order has been shipped.
              </p>
            </td>
          </tr>
          
          <!-- Order Info -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f3f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 0 16px;">
                    <p style="margin: 0; color: #6b5c4d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                    <p style="margin: 4px 0 0; font-size: 18px; font-weight: 600; color: #2c2420;">${orderNumber}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 16px;">
                    <p style="margin: 0; color: #6b5c4d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Shipping Method</p>
                    <p style="margin: 4px 0 0; font-size: 18px; font-weight: 600; color: #2c2420;">${shippingMethod}</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin: 0; color: #6b5c4d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Tracking Number</p>
                    <p style="margin: 4px 0 0; font-size: 18px; font-weight: 600; color: #2c2420;">${trackingNumber}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Track Button -->
          ${
            defaultTrackingUrl
              ? `
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <a href="${defaultTrackingUrl}" style="display: inline-block; padding: 16px 32px; background-color: #2c2420; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 0;">
                Track Your Package
              </a>
              <p style="margin: 16px 0 0; color: #6b5c4d; font-size: 14px;">
                Or copy this link: <a href="${defaultTrackingUrl}" style="color: #2c2420;">${defaultTrackingUrl}</a>
              </p>
            </td>
          </tr>
          `
              : ""
          }
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #2c2420; text-align: center;">
              <p style="margin: 0; color: #a69b8f; font-size: 14px;">
                Questions about your delivery? Reply to this email.
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
