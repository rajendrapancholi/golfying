"use server";
import { stripe } from "@/lib/stripe";

export async function cancelUserSubscription(subscriptionId: string) {
  await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
}