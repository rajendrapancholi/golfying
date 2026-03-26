import Tooltip from "@/components/ui/Tooltip";
import { createClient } from "@/lib/supabase/server";
import {
  UserCog,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Trophy,
  Heart,
} from "lucide-react";
import Link from "next/link";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users, error } = await supabase
    .from("profiles")
    .select("*, charities(name), scores!user_id(score_value, id)")
    .order("created_at", { ascending: false });

  if (error) console.error("Query Error:", error.message);
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Member Directory
          </h1>
          <p className="text-muted-foreground italic mt-1">
            Manage access, subscriptions, and verify performance data.
          </p>
        </div>
      </div>

      {/* Member Table */}
      <div className="bg-card border border-border rounded-4xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Hero
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Membership
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Rolling 5 Avg
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                Access
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                Control
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-muted/10 transition-colors group"
              >
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/10">
                      {user.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground leading-none mb-1">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail size={12} /> {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center">
                    <Tooltip
                      content={
                        user.subscription_status === "active"
                          ? "Verified Membership — Active"
                          : "Subscription Expired — Access Restricted"
                      }
                      position="right"
                    >
                      {/* Wrapper with hover effect for a modern 'Tech' feel */}
                      <div className="space-y-1.5 cursor-help group/status transition-opacity hover:opacity-80">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              user.subscription_status === "active"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }`}
                          >
                            {user.subscription_tier || "Free"}
                          </span>

                          {/* Subtle status indicator dot */}
                          <div
                            className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                              user.subscription_status === "active"
                                ? "bg-success"
                                : "bg-destructive"
                            }`}
                          />
                        </div>

                        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-bold tracking-tight">
                          <Heart
                            size={10}
                            className="text-secondary fill-secondary/10"
                          />
                          {user.charities?.name || "No Charity Selected"}
                        </p>
                      </div>
                    </Tooltip>
                  </div>
                </td>

                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <Trophy size={14} className="text-primary" />
                    <span className="font-black text-lg">
                      {user.scores?.length > 0
                        ? (
                            user.scores.reduce(
                              (a: any, b: any) => a + b.score_value,
                              0,
                            ) / user.scores.length
                          ).toFixed(1)
                        : "0.0"}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex justify-center">
                    <Tooltip
                      content={
                        user.role === "admin"
                          ? "Admin"
                          : user.is_active
                            ? "Verified member eligible for draws"
                            : "Access restricted by administration"
                      }
                      position="top"
                    >
                      {user.role === "admin" ? (
                        <span className="flex items-center gap-1.5 text-success text-[10px] font-black uppercase border border-success/20 px-3 py-1 rounded-full cursor-help bg-success/5 transition-all hover:bg-success/10">
                          <ShieldCheck size={12} strokeWidth={3} /> {user.role}
                        </span>
                      ) : user.is_active ? (
                        <span className="flex items-center gap-1.5 text-success text-[10px] font-black uppercase border border-success/20 px-3 py-1 rounded-full cursor-help bg-success/5 transition-all hover:bg-success/10">
                          <ShieldCheck size={12} strokeWidth={3} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-destructive text-[10px] font-black uppercase border border-destructive/20 px-3 py-1 rounded-full cursor-help bg-destructive/5 transition-all hover:bg-destructive/10">
                          <ShieldAlert size={12} strokeWidth={3} /> Suspended
                        </span>
                      )}
                    </Tooltip>
                  </div>
                </td>

                <td className="p-6 text-right">
                  <Link
                    href={`/admin-users/${user.id}`}
                    className="inline-flex bg-muted hover:bg-primary hover:text-white p-3 rounded-xl transition-all active:scale-90 shadow-primary/10"
                  >
                    <UserCog size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
