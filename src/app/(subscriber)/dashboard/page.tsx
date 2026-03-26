"use server";

import { stripe } from "@/lib/stripe";
import ScoreEntryForm from "@/components/forms/ScoreEntryForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Heart,
  Info,
  Trophy,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import CharityCard from "@/components/forms/CharityCart";
import { formatRegionalPrice } from "@/lib/utils/currency";

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
    .select("id, selected_charity_id, charity_percentage, region_id, winnings_total")
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

  // Fetch all charities info
  const { data: allCharities } = await supabase
    .from("charities")
    .select("id, name, logo_url")
    .order("name", { ascending: true });

  // Fetch winnings
  const { data: winnings } = await supabase
    .from("draw_winners")
    .select("*")
    .eq("user_id", user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-24 space-y-10 bg-background text-foreground transition-colors duration-300">

      {/* Subscription Status Banner */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Total Winnings
        </p>
        <h2 className="text-5xl font-black mt-2 text-primary">
          {formatRegionalPrice(profile.winnings_total || 0, profile.region_id)}
        </h2>
        <p className="text-xs text-muted-foreground mt-4 italic">
          Based on your {profile.region_id} competition region.
        </p>
      </div>
      <div
        className={`p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 shadow-sm ${
          subscription?.is_active
            ? "bg-success/5 border-success/20 text-success"
            : "bg-destructive/5 border-destructive/20 text-destructive"
        }`}
      >
        <div className="flex items-center gap-5">
          <div className="relative">
            {subscription?.is_active ? (
              <>
                <CheckCircle2 className="w-12 h-12 relative z-10" />
                <span className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
              </>
            ) : (
              <XCircle className="w-12 h-12" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight leading-tight">
              {subscription?.is_active ? "Verified Hero" : "Limited Access"}
            </h2>
            <p className="text-sm font-medium opacity-80 max-w-xs">
              {subscription?.is_active
                ? `You are on the ${subscription.plan} tier. All entries active.`
                : "Your scoring and prize eligibility are currently paused."}
            </p>
          </div>
        </div>

        {subscription?.is_active ? (
          <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-current/10 pt-4 md:pt-0 md:pl-8 w-full md:w-auto justify-around md:justify-start">
            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase font-black tracking-widest opacity-60">
                Next Draw
              </p>
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Calendar size={14} className="text-primary" />
                {new Date(subscription.next_renewal_date).toLocaleDateString()}
              </div>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase font-black tracking-widest opacity-60">
                Contribution
              </p>
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <CreditCard size={14} className="text-primary" />$
                {subscription.subscription_amount}
              </div>
            </div>
          </div>
        ) : (
          <Link
            href="/subscribe"
            className="w-full md:w-auto bg-destructive text-destructive-foreground px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            Resume Membership
          </Link>
        )}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Score Entry Form (Section 05: Rolling 5 logic) */}
          <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
            <div className="bg-muted/30 px-8 py-4 border-b border-border flex items-center gap-2">
              <Trophy size={16} className="text-primary" />
              <span className="font-bold text-sm">Post New Round</span>
            </div>
            <div className="p-8">
              <ScoreEntryForm />
            </div>
          </div>

          {/* Performance Table (Section 05) */}
          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div>
                <h3 className="font-bold text-lg">Rolling 5 Performance</h3>
                <p className="text-xs text-muted-foreground">
                  Latest rounds affecting your average
                </p>
              </div>
              <div className="bg-primary/10 text-primary p-2 rounded-full">
                <Info size={18} />
              </div>
            </div>

            <div className="divide-y divide-border">
              {scores?.map((s: any, index: number) => (
                <div
                  key={s.id}
                  className={`px-8 py-5 flex justify-between items-center hover:bg-muted/50 transition-colors ${index === 0 ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center bg-background border border-border w-12 h-12 rounded-xl">
                      <span className="text-xl font-black text-primary leading-none">
                        {s.score_value}
                      </span>
                    </div>
                    <div>
                      <span className="block font-bold text-sm">
                        Stableford Points
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(s.score_date).toLocaleDateString(undefined, {
                          dateStyle: "long",
                        })}
                      </span>
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-bold uppercase">
                      Latest
                    </span>
                  )}
                </div>
              ))}

              {(!scores || scores.length === 0) && (
                <div className="p-16 text-center">
                  <p className="text-muted-foreground italic mb-4">
                    No rounds recorded yet.
                  </p>
                  <button className="text-primary font-bold text-sm underline">
                    Learn how scoring works
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Charity Card */}
          <CharityCard
            profile={profile}
            charity={charity}
            allCharities={allCharities}
          />

          {/* Reward Tracker */}
          <div className="space-y-4">
            {!winnings || winnings?.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-border rounded-2xl">
                <p className="text-xs text-muted-foreground px-4 italic">
                  No winnings yet. Enter your scores to qualify for the next
                  draw!
                </p>
              </div>
            ) : (
              winnings.map((win: any) => {
                // Logic to determine the display label and color
                const isPaid = win.payment_status === "paid";
                const status = isPaid ? "paid" : win.verification_status;

                const statusStyles: Record<string, string> = {
                  pending: "bg-amber-100 text-amber-700 border-amber-200",
                  approved:
                    "bg-emerald-100 text-emerald-700 border-emerald-200",
                  rejected: "bg-red-100 text-red-700 border-red-200",
                  paid: "bg-blue-100 text-blue-700 border-blue-200",
                };

                return (
                  <div
                    key={win.id}
                    className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border hover:border-primary/30 transition-all shadow-sm group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-xl text-foreground">
                          ${Number(win.prize_amount).toLocaleString()}
                        </p>
                        {isPaid && (
                          <CheckCircle2 size={14} className="text-blue-600" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tight opacity-70">
                        {win.match_type}-Number Match
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[9px] px-2.5 py-1 rounded-full uppercase font-black border tracking-tighter ${statusStyles[status] || statusStyles.pending}`}
                      >
                        {status}
                      </span>
                      <p className="text-[8px] text-muted-foreground mt-1 font-bold opacity-50">
                        {new Date(win.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
