"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAdminAnalytics() {
  const supabase = await createClient();

  // Total Subscription Revenue (Sum of active subscription amounts)
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("subscription_amount, region_id")
    .eq("is_active", true);

  // Group revenue by region 
  const gbRevenue =
    subs
      ?.filter((s) => s.region_id === "GB")
      .reduce((acc, curr) => acc + curr.subscription_amount, 0) || 0;

  const usRevenue =
    subs
      ?.filter((s) => s.region_id === "US")
      .reduce((acc, curr) => acc + curr.subscription_amount, 0) || 0;

  const totalRevenue =
    (subs || []).reduce((acc, curr) => acc + curr.subscription_amount, 0) || 0;

  // Charity Contributions (10% of total revenue)
  const charityTotal = totalRevenue * 0.1;

  // User Growth (Count of profiles)
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return {
    totalRevenue,
    gbRevenue,
    usRevenue,
    charityTotal: totalRevenue * 0.1,
    userCount: userCount || 0,
    activeSubs: subs?.length || 0,
  };
}

export async function getAdminStats() {
  const supabase = await createClient();
  // Aggregate data for the dashboard
  const [users, prizePool, charity, draws] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("amount"),
    supabase.from("charity_contributions").select("amount"),
    supabase.from("draws").select("*"),
  ]);

  return {
    totalUsers: users.count || 0,
    totalPrizePool:
      prizePool.data?.reduce((acc, curr) => acc + curr.amount * 0.4, 0) || 0, // Example 40% share
    totalCharity:
      charity.data?.reduce((acc, curr) => acc + curr.amount, 0) || 0,
    drawCount: draws.data?.length || 0,
  };
}
