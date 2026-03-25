import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe"; // Add this import

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature")!;
  
  // Use SERVICE_ROLE_KEY to bypass RLS for system updates
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // 1. Handle Successful Checkout
  if (event.type === "checkout.session.completed") {
    // Cast to Checkout.Session to access metadata
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;

    if (userId) {
      await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          stripe_customer_id: session.customer as string,
        })
        .eq("id", userId);
    }
  }

  // 2. Handle Subscription Deletion
  if (event.type === "customer.subscription.deleted") {
    // Cast to Subscription to access the ID
    const subscription = event.data.object as Stripe.Subscription;
    
    await supabase
      .from("profiles")
      .update({
        subscription_status: "inactive"
      })
      .eq("stripe_customer_id", subscription.customer as string);
  }

  return NextResponse.json({ received: true });
}
