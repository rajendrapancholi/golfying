import { getAdminAnalytics } from "@/app/actions/adminReports";
import CampaignManager from "@/components/admin/CampaignManager";
import { createClient } from "@/lib/supabase/server";
import { formatRegionalPrice } from "@/lib/utils/currency";
import {
  TrendingUp,
  Heart,
  Users,
  CreditCard,
  ArrowUpRight,
  Megaphone,
} from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const stats = await getAdminAnalytics();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  const cards = [
    {
      label: "UK Revenue",
      value: formatRegionalPrice(stats.gbRevenue, "GB"),
      icon: CreditCard,
      bg: "bg-emerald-50",
      color: "text-emerald-600",
    },
    {
      label: "US Revenue",
      value: formatRegionalPrice(stats.usRevenue, "US"),
      icon: CreditCard,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      label: "Total (Global)",
      value: formatRegionalPrice(stats.totalRevenue, "US"),
      icon: TrendingUp,
      bg: "bg-primary/10",
      color: "text-primary",
    },
    {
      label: "Charity Impact",
      value: formatRegionalPrice(stats.charityTotal, "US"),
      icon: Heart,
      bg: "bg-rose-50",
      color: "text-rose-500",
    },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight">
          Platform Insights
        </h1>
        <p className="text-muted-foreground mt-2 italic">
          Real-time overview of revenue and charitable impact.
        </p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                <card.icon size={24} />
              </div>
              <ArrowUpRight
                size={16}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {card.label}
            </p>
            <h3 className="text-3xl font-black mt-1 text-foreground">
              {card.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Visual Break */}
      <div className="bg-secondary rounded-4xl p-10 text-secondary-foreground relative overflow-hidden shadow-xl shadow-secondary/20">
        <Heart
          className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10"
          fill="currentColor"
        />
        <div className="relative z-10 max-w-lg">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-80">
            Impact Goal
          </h3>
          <p className="text-4xl font-black mt-4 leading-tight">
            You've helped raise ${stats.charityTotal.toLocaleString()} for
            community causes this month.
          </p>
          <button className="mt-8 bg-white text-secondary px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
            View Charity Reports
          </button>
        </div>
      </div>

      {/* Action & Campaign Row */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Visual Break */}
        <div className="lg:col-span-2 bg-secondary rounded-4xl p-10 text-secondary-foreground relative overflow-hidden shadow-xl shadow-secondary/20 h-full">
          <Heart
            className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10"
            fill="currentColor"
          />
          <div className="relative z-10 max-w-lg">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-80">
              Impact Goal
            </h3>
            <p className="text-4xl font-black mt-4 leading-tight">
              You've helped raise ${stats.charityTotal.toLocaleString()} for
              community causes this month.
            </p>
            <button className="mt-8 bg-white text-secondary px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
              View Charity Reports
            </button>
          </div>
        </div>

        {/* Campaign Manager */}
        <div className="lg:col-span-1 h-full">
          <div className="flex items-center gap-2 mb-4 ml-2">
            <Megaphone size={16} className="text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Live Campaigns
            </h2>
          </div>
          <CampaignManager campaigns={campaigns || []} />
        </div>
      </div>
    </div>
  );
}
