"use server";

import { MONTHLY_PRICE_ID, YEARLY_PRICE_ID } from "@/lib/constants/stripe";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/index";

export async function createCheckoutSession(plan: "monthly" | "yearly") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const priceId = plan === "monthly" ? MONTHLY_PRICE_ID : YEARLY_PRICE_ID;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const customerId = profile?.stripe_customer_id || undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    metadata: {
      user_id: user.id,
      plan
    },
  });

  return session.url;
}
