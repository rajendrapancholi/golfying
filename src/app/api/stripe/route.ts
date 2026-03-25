import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore - Letting the SDK use its internal default version
  apiVersion: "2025-01-27.acacia",
});

// Use Service Role Key to bypass RLS since this is a system-to-system call
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Handle successful initial payment
  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "active",
        stripe_customer_id: session.customer as string,
        subscription_tier: subscription.items.data[0].plan.interval === "month" ? "monthly" : "yearly",
      })
      .eq("id", session.metadata?.user_id);
  }

  // Handle recurring renewals or failures
  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    
    await supabaseAdmin
      .from("profiles")
      .update({ subscription_status: "active" })
      .eq("stripe_customer_id", session.customer as string);
  }

  // Handle cancellations or failed payments
  if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
    await supabaseAdmin
      .from("profiles")
      .update({ subscription_status: "inactive" })
      .eq("stripe_customer_id", session.customer as string);
  }

  return NextResponse.json({ received: true });
}
