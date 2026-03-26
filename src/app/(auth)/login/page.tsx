"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";
import Image from "next/image"; // Added for the logo
import { Trophy, ArrowRight, Lock, Zap } from "lucide-react"; // Added Zap as a fallback icon
import AppLogo from "@/components/ui/AppLogo";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: null,
  });

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <AppLogo/>
      {/* Header */}
      <div className="text-center mb-8 max-w-md">
        <div className="inline-flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase mb-3 bg-primary/10 px-3 py-1 rounded-full">
          <Trophy size={14} />
          <span>Ready for the next draw?</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Welcome Back
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Log in to track your latest scores and support your chosen charity.
        </p>
      </div>

      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-xl shadow-foreground/5">
        <form action={formAction} className="flex flex-col gap-5">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground ml-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              className="w-full bg-muted/50 border border-border p-3.5 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-foreground">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary font-bold hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-muted/50 border border-border p-3.5 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
              />
              <Lock
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30"
              />
            </div>
          </div>

          {/* Error Display  */}
          {state?.error && (
            <p className="text-destructive text-sm text-center font-bold bg-destructive/10 p-4 rounded-xl border border-destructive/20 animate-in fade-in slide-in-from-top-1">
              {state.error}
            </p>
          )}

          {/* Prominent CTA */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-foreground text-background p-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-white active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-foreground/10"
          >
            {isPending ? (
              "Verifying..."
            ) : (
              <>
                Sign In to Dashboard <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Secondary Action */}
          <p className="text-center text-sm text-muted-foreground mt-2 font-medium">
            New to the platform?{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline transition-colors"
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>

      <p className="mt-10 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60 text-center max-w-xs">
        Securely powered by Golfying
      </p>
    </div>
  );
}
