"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAdminAnalytics() {
  const supabase = await createClient();

  // Total Subscription Revenue (Sum of active subscription amounts)
  const { data: revenueData } = await supabase
    .from("subscriptions")
    .select("subscription_amount")
    .eq("is_active", true);

  const totalRevenue = revenueData?.reduce((acc, curr) => acc + curr.subscription_amount, 0) || 0;

  // Charity Contributions (10% of total revenue as per PRD p. 5)
  const charityTotal = totalRevenue * 0.10;

  // User Growth (Count of profiles)
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return {
    totalRevenue,
    charityTotal,
    userCount: userCount || 0,
    activeSubs: revenueData?.length || 0,
  };
}
