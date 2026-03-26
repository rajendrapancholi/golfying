"use client";

import { createCheckout } from "@/app/actions/stripe";
import { Heart, Target, Zap } from "lucide-react";

export default function SubscribePage() {
  const monthlyAction = createCheckout.bind(null, "monthly");
  const yearlyAction = createCheckout.bind(null, "yearly");

  return (
    <div className="min-h-screen bg-background py-24 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section: Using Theme Variables */}
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-widest uppercase text-sm">
            Fuel Your Game. Change a Life.
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-foreground mt-4 mb-6">
            Small Rounds. <span className="text-primary">Big Impact.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the community where every golf score you log directly supports
            your favorite charity and enters you into our monthly prize pool.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-stretch pt-8">
          {/* Monthly Card: Adapts to Light/Dark */}
          <div className="group bg-card rounded-[2.5rem] p-10 border border-border hover:shadow-2xl transition-all duration-500 relative flex flex-col">
            <div className="bg-muted w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">
              <Zap className="text-foreground group-hover:text-primary w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Monthly Champion
            </h2>
            <div className="my-6 flex items-baseline">
              <span className="text-5xl font-black text-foreground">$15</span>
              <span className="text-muted-foreground ml-2">/ month</span>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              <FeatureItem text="Unlimited Rolling 5 Tracking" />
              <FeatureItem text="1 Entry to Monthly Prize Draw" />
              <FeatureItem text="$1.50 Guaranteed to Charity" />
            </div>

            <form action={monthlyAction}>
              <button className="w-full bg-foreground text-background py-5 rounded-2xl font-bold hover:bg-primary hover:text-white transition-all shadow-lg hover:shadow-primary/20">
                Join the Movement
              </button>
            </form>
          </div>

          {/* Yearly Card: Stay "Impact Dark" even in Light mode for contrast */}
          <div className="group bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-10 border-4 border-primary hover:shadow-2xl transition-all duration-500 relative flex flex-col scale-105 z-10">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase">
              Maximum Impact
            </div>
            <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
              <Heart className="text-primary w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white">Yearly Hero</h2>
            <div className="my-6 flex items-baseline">
              <span className="text-5xl font-black text-white">$150</span>
              <span className="text-slate-400 ml-2">/ year</span>
            </div>

            <div className="space-y-4 mb-10 flex-1 text-slate-300">
              <FeatureItem text="2 Months Free (Save $30)" isYearly />
              <FeatureItem text="$15 Guaranteed to Charity" isYearly />
              <FeatureItem text="Priority Winner Verification" isYearly />
              <FeatureItem text="Featured Supporter Status" isYearly />
            </div>

            <form action={yearlyAction}>
              <button className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-bold hover:bg-white hover:text-primary transition-all shadow-lg shadow-primary/20">
                Become a Hero
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  text,
  isYearly = false,
}: {
  text: string;
  isYearly?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center ${
          isYearly ? "bg-primary/20" : "bg-primary/10"
        }`}
      >
        <Target
          className={`w-3 h-3 ${isYearly ? "text-primary" : "text-primary"}`}
        />
      </div>
      <span className={isYearly ? "text-slate-300" : "text-muted-foreground"}>
        {text}
      </span>
    </div>
  );
}
