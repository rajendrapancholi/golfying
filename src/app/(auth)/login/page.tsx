"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";
import { Trophy, ArrowRight, Lock } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: null,
  });

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4">
      {/* Header */}
      <div className="text-center mb-8 max-w-md">
        <div className="inline-flex items-center gap-2 text-primary font-medium mb-2">
          <Trophy size={18} />
          <span>Ready for the next draw?</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Welcome Back
        </h1>
        <p className="text-muted-foreground mt-2">
          Log in to track your latest scores and support your chosen charity.
        </p>
      </div>

      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-sm">
        <form action={formAction} className="flex flex-col gap-5">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              className="w-full bg-muted border-none p-3 rounded-md focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-foreground">
                Password
              </label>
              <Link href="#" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-muted border-none p-3 rounded-md focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground"
              />
              <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            </div>
          </div>

          {/* Error Display  */}
          {state?.error && (
            <p className="text-destructive text-sm text-center font-medium bg-destructive/10 p-3 rounded-md border border-destructive/20">
              {state.error}
            </p>
          )}

          {/* Prominent CTA */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground p-4 rounded-md font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-md"
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
          <p className="text-center text-sm text-muted-foreground mt-2">
            New to the platform?{" "}
            <Link href="/register" className="text-foreground font-bold hover:text-primary transition-colors">
              Create an account
            </Link>
          </p>
        </form>
      </div>

      {/* Subtle Footer */}
      <p className="mt-8 text-xs text-muted-foreground text-center max-w-xs">
        Securely powered by Supabase Auth. Your data is encrypted and protected.
      </p>
    </div>
  );
}
