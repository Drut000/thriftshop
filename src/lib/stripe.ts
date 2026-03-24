import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
  typescript: true,
});

export function formatAmountForStripe(amount: number): number {
  // Stripe expects amounts in smallest currency unit (grosze for PLN)
  return Math.round(amount * 100);
}
