"use client";

import { useActionState, useEffect, useState } from "react";
import { Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { forgotPasswordAction } from "@/app/actions/profile";

interface ForgotPasswordProps {
  initialEmail?: string;
}

const ForgotPassword = ({ initialEmail = "" }: ForgotPasswordProps) => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [resetState, forgotAction, resetPending] = useActionState(
    forgotPasswordAction,
    null,
  );

  useEffect(() => {
    if (resetState?.success) {
      toast.success(
        resetState.message || "Check your email for password reset link!",
      );
      setShowForgotPassword(false);
    } else if (resetState?.error) {
      toast.error(resetState.error);
    }
  }, [resetState]);

  return (
    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
            <Lock className="text-destructive" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground leading-none">
              Security
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Manage your password and access
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForgotPassword(!showForgotPassword)}
          className={`text-sm font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${
            showForgotPassword
              ? "bg-muted text-muted-foreground hover:bg-muted/80"
              : "text-destructive hover:bg-destructive/10"
          }`}
        >
          {showForgotPassword ? "Cancel" : "Reset Password"}
        </button>
      </div>

      {showForgotPassword && (
        <form
          action={forgotAction}
          className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-2xl">
            <p className="text-sm text-destructive font-medium flex items-start gap-2">
              <span className="mt-0.5">●</span>
              Enter your email address and we'll send you a secure link to reset
              your password.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-1.5">
              <Mail size={12} className="text-destructive" /> Confirm Email
              Address
            </label>
            <input
              name="forgotEmail"
              type="email"
              defaultValue={initialEmail}
              placeholder="your.email@example.com"
              required
              className="w-full bg-muted/50 border border-border p-4 rounded-xl focus:ring-2 focus:ring-destructive outline-none transition-all font-bold text-foreground placeholder:font-medium placeholder:text-muted-foreground/40"
            />
          </div>

          <button
            type="submit"
            disabled={resetPending}
            className="w-full md:w-auto bg-destructive text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-destructive/20"
          >
            {resetPending ? (
              "Sending Secure Link..."
            ) : (
              <>
                <Mail size={18} /> Send Reset Link
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
