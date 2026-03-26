"use client";

import {
  updateProfileAction,
  updateEmailAction,
  updatePasswordAction,
  forgotPasswordAction,
  verifyEmailOtpAction,
} from "@/app/actions/profile";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  User,
  Save,
  Lock,
  Mail,
  CreditCard,
  ArrowUpCircle,
} from "lucide-react";
import Link from "next/link";

export default function Settings({ profile, charities, subscription }: any) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    null,
  );

  const [emailState, emailAction, emailPending] = useActionState(
    updateEmailAction,
    null,
  );

  const [passwordState, passwordAction, passwordPending] = useActionState(
    updatePasswordAction,
    null,
  );

  const [resetState, forgotAction, resetPending] = useActionState(
    forgotPasswordAction,
    null,
  );

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Handle profile action state changes
  useEffect(() => {
    if (profileState?.success) {
      toast.success("Profile updated successfully!");
    } else if (profileState?.error) {
      toast.error(profileState.error);
    }
  }, [profileState]);

  // Handle email action state changes
  useEffect(() => {
    if (emailState?.success) {
      toast.success(
        emailState.message || "Check your emails to confirm the change!",
      );
    } else if (emailState?.error) {
      toast.error(emailState.error);
    }
  }, [emailState]);

  // Handle password action state changes
  useEffect(() => {
    if (passwordState?.success) {
      toast.success(passwordState.message || "Password updated successfully!");
    } else if (passwordState?.error) {
      toast.error(passwordState.error);
    }
  }, [passwordState]);

  // Handle reset password action state changes
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

  const [otpState, otpAction, otpPending] = useActionState(
    verifyEmailOtpAction,
    null,
  );

  // Success handling for OTP verification
  useEffect(() => {
    if (otpState?.success) {
      toast.success(otpState.message);
    } else if (otpState?.error) {
      toast.error(otpState.error);
    }
  }, [otpState]);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-10">
      <header>
        <h1 className="text-4xl font-black text-foreground tracking-tight">
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-2 italic">
          Refine your profile and maximize your impact.
        </p>
      </header>

      {/* Profile & Charity Section */}
      <form action={profileAction} className="space-y-6">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <User className="text-primary" size={20} />
            <h3 className="font-bold text-lg text-foreground">
              Identity & Impact
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                Display Name
              </label>
              <input
                name="name"
                defaultValue={profile?.full_name}
                className="w-full bg-muted border-none p-4 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                Chosen Charity
              </label>
              <select
                name="charityId"
                defaultValue={profile?.selected_charity_id}
                className="w-full bg-muted border-none p-4 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer font-medium"
              >
                {charities?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            disabled={profilePending}
            className="w-full md:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {profilePending ? (
              "Syncing..."
            ) : (
              <>
                <Save size={18} /> Update Profile
              </>
            )}
          </button>
        </div>
      </form>

      {/* Subscription Management */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="text-info" size={20} />
            <h3 className="font-bold text-lg text-foreground">
              Membership Plan
            </h3>
          </div>
          <span
            className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${subscription?.is_active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
          >
            {subscription?.plan || "Free"} Tier
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted rounded-2xl">
          <div>
            <p className="text-sm font-bold text-foreground">
              {subscription?.plan === "yearly"
                ? "Annual Hero"
                : "Monthly Supporter"}
            </p>
            <p className="text-xs text-muted-foreground italic">
              Your next contribution: {subscription?.next_renewal_date || "N/A"}
            </p>
          </div>
          <Link
            href="/subscribe"
            className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
          >
            <ArrowUpCircle size={16} /> Upgrade Plan
          </Link>
        </div>
      </div>

      {/* Email Update Section */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <Mail className="text-info" size={20} />
          <h3 className="font-bold text-lg text-foreground">Email Address</h3>
        </div>

        {!emailState?.needsOtp ? (
          /* Request Change */
          <form action={emailAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-1.5">
                <Lock size={12} /> Current Password
              </label>
              <input
                name="currentPassword"
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-muted border-none p-4 rounded-xl focus:ring-2 focus:ring-secondary outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                New Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-muted border-none p-4 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                placeholder="new.email@example.com"
              />
            </div>
            <button
              disabled={emailPending}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold disabled:opacity-50"
            >
              {emailPending ? "Sending OTP..." : "Update Email"}
            </button>
          </form>
        ) : (
          /* Verify OTP */
          <form action={otpAction} className="space-y-4">
            <input type="hidden" name="email" value={emailState.email} />
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                Enter OTP sent to {emailState.email}
              </label>
              <input
                name="otp"
                type="text"
                required
                maxLength={6}
                className="w-full bg-muted border-none p-4 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold tracking-[1em] text-center"
                placeholder="000000"
              />
            </div>
            <button
              disabled={otpPending}
              className="w-full bg-success text-success-foreground py-4 rounded-xl font-bold disabled:opacity-50"
            >
              {otpPending ? "Verifying..." : "Confirm Code"}
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full text-xs text-muted-foreground underline"
            >
              Cancel and try again
            </button>
          </form>
        )}
      </div>
      {/* <form
        action={emailAction}
        className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3">
          <Mail className="text-info" size={20} />
          <h3 className="font-bold text-lg text-foreground">
            Email Address
          </h3>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-1.5">
            <Mail size={12} /> New Email Address
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="your.new.email@example.com"
            className="w-full bg-muted border-none p-4 rounded-xl focus:ring-2 focus:ring-info outline-none transition-all font-medium"
          />
          <p className="text-xs text-muted-foreground italic">
            You'll need to confirm this change via email.
          </p>
        </div>

        <button
          disabled={emailPending}
          className="w-full md:w-auto bg-info text-background px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {emailPending ? (
            "Updating..."
          ) : (
            <>
              <Mail size={18} /> Update Email
            </>
          )}
        </button>
      </form> */}

      {/* Password Update Section */}
      <form
        action={passwordAction}
        className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3">
          <Lock className="text-secondary" size={20} />
          <h3 className="font-bold text-lg text-foreground">Change Password</h3>
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-1.5">
              <Lock size={12} /> Current Password
            </label>
            <input
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              required
              className="w-full bg-muted border-none p-4 rounded-xl focus:ring-2 focus:ring-secondary outline-none transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-1.5">
              <Lock size={12} /> New Password
            </label>
            <input
              name="newPassword"
              type="password"
              placeholder="••••••••"
              required
              className="w-full bg-muted border-none p-4 rounded-xl focus:ring-2 focus:ring-secondary outline-none transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-1.5">
              <Lock size={12} /> Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              className="w-full bg-muted border-none p-4 rounded-xl focus:ring-2 focus:ring-secondary outline-none transition-all font-medium"
            />
          </div>
        </div>

        <button
          disabled={passwordPending}
          className="w-full md:w-auto bg-secondary text-secondary-foreground px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {passwordPending ? (
            "Updating..."
          ) : (
            <>
              <Lock size={18} /> Update Password
            </>
          )}
        </button>
      </form>

      {/* Forgot Password Section */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="text-destructive" size={20} />
            <h3 className="font-bold text-lg text-foreground">
              Forgot Password?
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowForgotPassword(!showForgotPassword)}
            className="text-sm text-destructive font-bold hover:underline"
          >
            {showForgotPassword ? "Cancel" : "Reset Password"}
          </button>
        </div>

        {showForgotPassword && (
          <form action={forgotAction} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-1.5">
                <Mail size={12} /> Email Address
              </label>
              <input
                name="forgotEmail"
                type="email"
                defaultValue={profile?.currEmail}
                placeholder="your.email@example.com"
                required
                className="w-full bg-muted border-none p-4 rounded-xl focus:ring-2 focus:ring-destructive outline-none transition-all font-medium"
              />
            </div>

            <button
              disabled={resetPending}
              className="w-full md:w-auto bg-destructive text-destructive-foreground px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetPending ? (
                "Sending..."
              ) : (
                <>
                  <Mail size={18} /> Send Reset Link
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
