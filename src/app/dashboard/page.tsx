"use server";

import { stripe } from "@/lib/stripe";
import ScoreEntryForm from "@/components/forms/ScoreEntryForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, CheckCircle2, CreditCard, XCircle } from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userName = user.user_metadata?.full_name || "User";
  const { session_id } = await searchParams;

  const { data: profile, error: _profileError } = await supabase
    .from("profiles")
    .select("id, selected_charity_id, charity_percentage")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Welcome, {userName}!</h2>
        <p className="mt-4 text-muted-foreground">
          We're setting up your account. Please complete your registration.
        </p>
        <button className="mt-4 bg-primary text-white p-2 rounded">
          Complete Profile
        </button>
      </div>
    );
  }
  // const profileData = profile as UserProfile; // define the types later

  // Handle Stripe Session Sync
  if (session_id && typeof session_id === "string") {
    if (session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid") {
        const amount = session.amount_total ? session.amount_total / 100 : 15.0;

        const { error: subError } = await supabase.from("subscriptions").upsert(
          {
            user_id: user.id,
            stripe_customer_id: session.customer as string,
            plan: (session.metadata?.plan as "monthly" | "yearly") || "monthly",
            is_active: true,
            subscription_amount: amount,
            next_renewal_date: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
          { onConflict: "user_id" },
        );

        if (!subError) {
          redirect("/dashboard?payment=success");
        } else {
          console.error("Sync Error:", subError.message);
        }
      }
    }
  }

  // Fetch subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch last 5 scores
  const { data: scores } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false })
    .limit(5);

  // Fetch charity info
  const { data: charity } = await supabase
    .from("charities")
    .select("*")
    .eq("id", profile.selected_charity_id)
    .maybeSingle();

  // Fetch winnings
  const { data: winnings } = await supabase
    .from("draw_winners")
    .select("*")
    .eq("user_id", user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 space-y-10 bg-background text-foreground transition-colors duration-300">
      <div
        className={`p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
          subscription?.is_active
            ? "bg-success/10 border-success/20 text-success"
            : "bg-destructive/10 border-destructive/20 text-destructive"
        }`}
      >
        <div className="flex items-center gap-4">
          {subscription?.is_active ? (
            <CheckCircle2 className="w-10 h-10 animate-pulse" />
          ) : (
            <XCircle className="w-10 h-10" />
          )}
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">
              {subscription?.is_active
                ? "Subscription Active"
                : "Action Required"}
            </h2>
            <p className="text-sm opacity-80 font-medium">
              {subscription?.is_active
                ? `Level: ${subscription.plan?.toUpperCase()} Plan`
                : "Subscribe now to enter the monthly prize draw and log scores."}
            </p>
          </div>
        </div>

        {subscription?.is_active && (
          <div className="flex items-center gap-6 border-l border-current/20 pl-6">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold opacity-60">
                Renewal Date
              </p>
              <div className="flex items-center gap-1.5 font-bold">
                <Calendar size={14} />
                {new Date(subscription.next_renewal_date).toLocaleDateString()}
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold opacity-60">
                Amount
              </p>
              <div className="flex items-center gap-1.5 font-bold">
                <CreditCard size={14} />${subscription.subscription_amount}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card p-1 rounded-3xl shadow-sm border border-border">
            <ScoreEntryForm />
          </div>

          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="font-bold text-lg text-foreground">
                Rolling 5 Performance
              </h3>
              <span className="text-muted-foreground text-sm">
                Auto-rotating latest rounds
              </span>
            </div>

            <div className="divide-y divide-border">
              {scores?.map((s) => (
                <div
                  key={s.id}
                  className="px-8 py-5 flex justify-between items-center hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-3xl font-black text-primary">
                      {s.score_value}
                    </span>
                    <div className="h-8 w-px bg-border" />
                    <span className="text-muted-foreground font-medium">
                      Stableford Round
                    </span>
                  </div>
                  <span className="text-muted-foreground font-mono text-sm">
                    {new Date(s.score_date).toLocaleDateString()}
                  </span>
                </div>
              ))}

              {(!scores || scores.length === 0) && (
                <div className="p-10 text-center text-muted-foreground italic">
                  No rounds recorded yet. Use the form above to start.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-primary rounded-3xl p-8 text-primary-foreground shadow-xl shadow-primary/20">
            <h3 className="opacity-80 font-bold uppercase text-xs tracking-widest">
              Selected Charity
            </h3>
            <p className="text-2xl font-bold mt-2">
              {charity?.name || "Ready to Choose"}
            </p>
            <div className="mt-6 pt-6 border-t border-primary-foreground/20">
              <div className="flex justify-between items-center">
                <span className="opacity-80">Current Contribution</span>
                <span className="text-xl font-bold">
                  {profile.charity_percentage || 10}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-8 border border-border shadow-md">
            <h3 className="text-muted-foreground font-bold uppercase text-xs tracking-widest">
              Reward Tracker
            </h3>
            <div className="mt-4 space-y-4">
              {!winnings || winnings?.length === 0 ? (
                <p className="text-muted-foreground italic">
                  No winnings to display yet. Good luck in the next draw!
                </p>
              ) : (
                winnings.map((win) => (
                  <div
                    key={win.id}
                    className="flex justify-between items-center bg-muted p-4 rounded-2xl border border-border"
                  >
                    <div>
                      <p className="font-bold text-foreground">
                        £{win.prize_amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {win.match_type}-Match Winner
                      </p>
                    </div>
                    <span className="text-[10px] bg-primary text-primary-foreground px-3 py-1 rounded-md uppercase font-bold">
                      {win.verification_status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
