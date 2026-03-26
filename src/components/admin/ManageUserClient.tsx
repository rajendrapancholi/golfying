"use client";

import {
  adminUpdateUser,
  adminDeleteScore,
  adminUpdateSubscription,
} from "@/app/actions/adminUsers";
import {
  User,
  Trophy,
  CreditCard,
  Mail,
  Trash2,
  ArrowLeft,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import StatusButton from "../ui/StatusButton";
import { createClient } from "@/lib/supabase/client";

export default function ManageUserClient({ user }: { user: any }) {
  if (!user)
    return <div className="p-12 text-center font-bold">User Not Found</div>;

  const supabase = createClient();

  const [selectedCharity, setSelectedCharity] = useState(
    user?.selected_charity_id,
  );

  const [charities, setCharities] = useState<any[]>([]);

  useEffect(() => {
    if (user?.selected_charity_id) {
      setSelectedCharity(user.selected_charity_id);
    }
  }, [user]);
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

  const [updateUserState, updateUser, updateUserPending] = useActionState(
    adminUpdateUser,
    null,
  );

  const [deleteScoreState, deleteScore, deleteScorePending] = useActionState(
    adminDeleteScore,
    null,
  );
  const [
    updateSubscriptionState,
    updateSubscriptionScore,
    updateSubscriptionPending,
  ] = useActionState(adminUpdateSubscription, null);

  // Handle profile action state changes
  useEffect(() => {
    if (updateUserState?.success) {
      toast.success("Profile updated successfully!");
    } else if (updateUserState?.error) {
      toast.error(updateUserState.error);
    }
  }, [updateUserState]);

  useEffect(() => {
    if (deleteScoreState?.success) {
      toast.success("Profile updated successfully!");
    } else if (deleteScoreState?.error) {
      toast.error(deleteScoreState.error);
    }
  }, [deleteScoreState]);

  useEffect(() => {
    if (updateSubscriptionState?.success) {
      toast.success("Profile updated successfully!");
    } else if (updateSubscriptionState?.error) {
      toast.error(updateSubscriptionState.error);
    }
  }, [updateSubscriptionState]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10 animate-in fade-in slide-in-from-bottom-2">
      <Link
        href="/admin-users"
        className="text-xs font-black uppercase flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft size={14} /> Back to Directory
      </Link>

      <header>
        <h1 className="text-4xl font-black tracking-tighter">Manage Hero</h1>
        <p className="text-muted-foreground italic mt-1">
          Direct oversight for {user.full_name}
        </p>
      </header>

      {/* USER PROFILE */}
      <section className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <User className="text-primary" size={20} />
          <h3 className="font-bold text-lg">Profile & Identity</h3>
        </div>
        <form action={updateUser} className="grid md:grid-cols-2 gap-6">
          <input type="hidden" name="userId" value={user.id} />
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Full Name
            </label>
            <input
              name="full_name"
              defaultValue={user.full_name}
              className="w-full bg-muted border-none p-4 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
              Chosen Charity
            </label>

            {charities.length > 0 ? (
              <select
                name="charityId"
                key={selectedCharity}
                defaultValue={selectedCharity}
                className="w-full bg-muted border-none p-4 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer font-medium"
              >
                {charities.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full bg-muted h-14 rounded-xl animate-pulse flex items-center px-4">
                <span className="text-xs text-muted-foreground italic">
                  Loading charities...
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Email (View Only)
            </label>
            <div className="p-4 bg-muted/50 rounded-xl text-muted-foreground text-sm flex items-center gap-2 italic">
              <Mail size={14} /> {user.email}
            </div>
          </div>
          <div className="md:col-span-2 flex-center">
          <StatusButton
            buttonText="Save Profile Changes"
            pendingMessage="Saving Profile Changes"
            pending={updateUserPending}
            icon={Info}
            />
            </div>
        </form>
      </section>

      {/* GOLF SCORES (ROLLING 5) */}
      <section className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="text-primary" size={20} />
          <h3 className="font-bold text-lg">Performance Logs (Stableford)</h3>
        </div>
        <div className="space-y-3">
          {user.scores?.map((score: any) => (
            <div
              key={score.id}
              className="flex justify-between items-center bg-muted/50 p-4 rounded-2xl border border-border group hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-primary">
                  {score.score_value}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(score.score_date).toLocaleDateString()}
                </span>
              </div>
              <form action={deleteScore}>
                <input type="hidden" name="scoreId" value={score.id} />
                <button className="text-muted-foreground hover:text-destructive p-2 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </form>
            </div>
          ))}
          {user.scores?.length === 0 && (
            <p className="text-center text-muted-foreground italic py-4">
              No scores recorded for this user.
            </p>
          )}
        </div>
      </section>

      {/* SUBSCRIPTION MANAGEMENT */}
      <section className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="text-info" size={20} />
          <h3 className="font-bold text-lg">Membership & Billing</h3>
        </div>
        <div className="p-6 bg-muted rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 border border-border">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
              Current Tier
            </p>
            <p className="text-xl font-black text-foreground uppercase">
              {user.subscription_tier || "Free"}
            </p>
          </div>
          <div className="flex gap-2">
            <form action={updateSubscriptionScore}>
              <input type="hidden" name="userId" value={user.id} />
              <button
                name="tier"
                value="paid"
                className="bg-success text-white px-6 py-2 rounded-xl font-bold text-xs hover:scale-105 transition-all"
              >
                Grant Paid Access
              </button>
            </form>
            <form action={updateSubscriptionScore}>
              <input type="hidden" name="userId" value={user.id} />
              <button
                name="tier"
                value="free"
                className="bg-destructive/10 text-destructive border border-destructive/20 px-6 py-2 rounded-xl font-bold text-xs hover:bg-destructive/20 transition-all"
              >
                Revoke Access
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
