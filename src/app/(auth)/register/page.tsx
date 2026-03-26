"use client";

import { registerAction } from "@/app/actions/auth";
import { useActionState, useEffect, useState } from "react";
import { Heart, Trophy, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const supabase = createClient();
  const [charities, setCharities] = useState<any[]>([]);

  const [state, formAction, isPending] = useActionState(registerAction, {
    error: null,
  });

  // Fetch all charities info
  useEffect(() => {
    async function getCharities() {
      const { data } = await supabase
        .from("charities")
        .select("*")
        .order("name");

      if (data) setCharities(data);
    }
    getCharities();
  }, [supabase]);

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4">
      {/* Header */}
      <div className="text-center mb-8 max-w-md">
        <div className="inline-flex items-center gap-2 text-secondary font-medium mb-2">
          <Heart size={18} fill="currentColor" />
          <span>Impact starts with a swing</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Join the Club
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your scores, win prizes, and support what matters.
        </p>
      </div>

      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-sm">
        <form action={formAction} className="flex flex-col gap-5">
          {/* User Info Section */}
          <div className="space-y-4">
            <input
              name="name"
              placeholder="Full Name"
              required
              className="w-full bg-muted border-none p-3 rounded-md focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground"
            />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              className="w-full bg-muted border-none p-3 rounded-md focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground"
            />
            <input
              name="password"
              type="password"
              placeholder="Create Password"
              required
              className="w-full bg-muted border-none p-3 rounded-md focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground"
            />
          </div>

          <hr className="border-border my-2" />

          {/* Mandatory Charity Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Heart size={14} className="text-secondary" /> Choose Your Cause
            </label>
            <select
              name="charityId"
              required
              className="w-full bg-muted border-none p-3 rounded-md appearance-none cursor-pointer text-foreground focus:ring-2 focus:ring-primary transition-all"
            >
              {charities?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subscription Plan Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Trophy size={14} className="text-primary" /> Select Your
              Membership
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Free Tier - For Restricted Access */}
              <label className="cursor-pointer group">
                <input
                  type="radio"
                  name="plan"
                  value="free"
                  className="peer hidden"
                  defaultChecked
                />
                <div className="h-full p-4 border border-border rounded-md text-center peer-checked:border-muted-foreground peer-checked:bg-muted transition-all flex flex-col justify-center">
                  <span className="block text-sm font-bold text-foreground">
                    Free
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Restricted
                  </span>
                </div>
              </label>

              {/* Monthly Tier */}
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="plan"
                  value="monthly"
                  className="peer hidden"
                />
                <div className="h-full p-4 border border-border rounded-md text-center peer-checked:border-primary peer-checked:bg-primary/5 transition-all flex flex-col justify-center">
                  <span className="block text-sm font-bold text-foreground">
                    Monthly
                  </span>
                  <span className="text-[10px] text-primary uppercase tracking-wider font-bold">
                    Standard
                  </span>
                </div>
              </label>

              {/* Yearly Tier - Conversion Driver */}
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="plan"
                  value="yearly"
                  className="peer hidden"
                />
                <div className="h-full p-4 border border-border rounded-md text-center peer-checked:border-primary peer-checked:bg-primary/5 transition-all relative flex flex-col justify-center">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-success text-[9px] text-white px-2 py-0.5 rounded-full font-bold shadow-sm whitespace-nowrap">
                    BEST VALUE
                  </div>
                  <span className="block text-sm font-bold text-foreground">
                    Yearly
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Save 20%
                  </span>
                </div>
              </label>
            </div>
          </div>

          {state?.error && (
            <p className="text-destructive text-sm text-center font-medium bg-destructive/10 p-2 rounded-sm">
              {state.error}
            </p>
          )}

          {/* Prominent CTA */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground p-4 rounded-md font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              "Setting up your profile..."
            ) : (
              <>
                Complete Registration <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
