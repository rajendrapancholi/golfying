import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore - Letting the SDK use its internal default version
  apiVersion: "2025-01-27.acacia",
});