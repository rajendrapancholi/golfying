"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function executeMonthlyDraw(
  _previousState: any,
  formData: FormData,
) {
  const supabase = await createAdminClient();
  const logic = formData.get("logic") as string; // 'random' or 'algorithm'
  const isSimulation = formData.get("isSimulation") === "true";
  const region = formData.get("region") as string || "GB";

  // Generate Winning Numbers (Stableford range is 1-45)
  let winningNumbers: number[] = [];

  if (logic === "algorithm") {
    // Weighted by most frequent user scores
    const { data: frequency } = await supabase.rpc("get_score_frequencies");
    // Simplified: Take top 5 most frequent + 1 random
    winningNumbers =
      frequency?.slice(0, 5).map((f: any) => f.score_value) || [];
    while (winningNumbers.length < 5) {
      const num = Math.floor(Math.random() * 45) + 1;
      if (!winningNumbers.includes(num)) winningNumbers.push(num);
    }
  } else {
    // Pure Random (Standard Lottery Style)
    while (winningNumbers.length < 5) {
      const num = Math.floor(Math.random() * 45) + 1;
      if (!winningNumbers.includes(num)) winningNumbers.push(num);
    }
  }
  winningNumbers.sort((a, b) => a - b);

  const DEBUG_USER_ID = process.env.DEBUG_USER_ID;
   "0c8cb32f-90e6-44de-b039-39189842e8b9";

  if (process.env.DEBUG_MODE === "enable") {
    const { data: testUserScores } = await supabase
      .from("scores")
      .select("score_value")
      .eq("user_id", DEBUG_USER_ID)
      .limit(5);

    if (testUserScores && testUserScores.length > 0) {
      // This forces the draw to match exactly what this user submitted
      winningNumbers = testUserScores.map((s) => s.score_value);
      console.log(
        "DEBUG: Forced winning numbers to match user scores:",
        winningNumbers,
      );
    }
  }
  // Calculate Prize Pool & Fetch Rollover
  const { data: activeSubs } = await supabase
    .from("profiles")
    .select("id")
    .eq("subscription_status", "active")
    .eq("region_id", region);

  const { data: activeCampaign } = await supabase
    .from("campaigns")
    .select("donation_multiplier")
    .eq("is_active", true)
    .maybeSingle();

  const multiplier = activeCampaign?.donation_multiplier || 1.0;
  const baseCharityRate = 0.1; // 10% minimum
  const effectiveCharityRate = baseCharityRate * Number(multiplier);

  // Financial Calculations
  const { data: lastDraw } = await supabase
    .from("draws")
    .select("rollover_amount")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const subscriberCount = activeSubs?.length || 0;
  const subscriptionPrice = 20; // Assume $20/mo
  const poolContribution = 0.6 - effectiveCharityRate;

  const currentMonthPool =
    subscriberCount * subscriptionPrice * poolContribution;
  const previousRollover = lastDraw?.rollover_amount || 0;

  // Match Logic: Group scores by User
  const { data: allScores } = await supabase
    .from("scores")
    .select("user_id, score_value")
    .in("user_id", activeSubs?.map((s) => s.id) || []);

  const userScoresMap: Record<string, number[]> = {};

  allScores?.forEach((s) => {
    if (!userScoresMap[s.user_id]) userScoresMap[s.user_id] = [];
    userScoresMap[s.user_id].push(Number(s.score_value));
  });

  const winNums = winningNumbers.map(Number);
  const userMatches: Record<string, number> = {};

  Object.entries(userScoresMap).forEach(([userId, scores]) => {
    // We only want to match unique winning numbers against unique user scores
    // to satisfy the "Match 5" lottery style requirement.
    const uniqueUserScores = [...new Set(scores)];
    const matches = uniqueUserScores.filter((s) => winNums.includes(s)).length;

    if (matches >= 3) {
      userMatches[userId] = matches;
    }
  });
  // Categorize Winners by Tier
  const winnersByTier = {
    match5: Object.entries(userMatches)
      .filter(([_, count]) => count === 5)
      .map((e) => e[0]),
    match4: Object.entries(userMatches)
      .filter(([_, count]) => count === 4)
      .map((e) => e[0]),
    match3: Object.entries(userMatches)
      .filter(([_, count]) => count === 3)
      .map((e) => e[0]),
  };

  // Calculate Payouts per Tier (PRD Section 07)
  const pool5 = currentMonthPool * 0.4 + previousRollover;
  const pool4 = currentMonthPool * 0.35;
  const pool3 = currentMonthPool * 0.25;

  const prizes = {
    tier5:
      winnersByTier.match5.length > 0 ? pool5 / winnersByTier.match5.length : 0,
    tier4:
      winnersByTier.match4.length > 0 ? pool4 / winnersByTier.match4.length : 0,
    tier3:
      winnersByTier.match3.length > 0 ? pool3 / winnersByTier.match3.length : 0,
  };

  // New Rollover if no 5-match winner
  const newRollover = winnersByTier.match5.length === 0 ? pool5 : 0;

  // Simulation Guard
  const stats = {
    totalPool: currentMonthPool,
    winners: winnersByTier,
    prizes,
    newRollover,
    campaignMultiplier: multiplier,
    charityRate: (effectiveCharityRate * 100).toFixed(0) + "%",
  };

  if (isSimulation) {
    return { success: true, isSimulation: true, winningNumbers, stats };
  }

  // Save to DB
  const { data: draw } = await supabase
    .from("draws")
    .insert({
      winning_numbers: winningNumbers,
      total_pool: currentMonthPool,
      rollover_amount: newRollover,
      status: "published",
    })
    .select().single();

  const winnerInserts = [
    ...winnersByTier.match5.map((uid) => ({
      draw_id: draw.id,
      user_id: uid,
      match_type: 5,
      prize_amount: prizes.tier5,
    })),
    ...winnersByTier.match4.map((uid) => ({
      draw_id: draw.id,
      user_id: uid,
      match_type: 4,
      prize_amount: prizes.tier4,
    })),
    ...winnersByTier.match3.map((uid) => ({
      draw_id: draw.id,
      user_id: uid,
      match_type: 3,
      prize_amount: prizes.tier3,
    })),
  ];

  if (winnerInserts.length > 0) {
    await supabase.from("draw_winners").insert(winnerInserts);
  }

  revalidatePath("/admin-draws");
  return { success: true, winningNumbers, stats };
}
