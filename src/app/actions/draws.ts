"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Run the monthly draw
 */
export async function runMonthlyDrawAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.role !== "admin") redirect("/dashboard");

  // Create a new draw record for this month
  const drawMonth = new Date().toISOString().slice(0, 7) + "-01"; // e.g., '2026-03-01'

  // Calculate total prize pool from subscriptions
  const { data: subs, error: subErr } = await supabase
    .from("subscriptions")
    .select("id, amount, is_active")
    .eq("is_active", true);

  if (subErr) throw new Error(subErr.message);

  const totalPrizePool = subs?.reduce((sum, s) => sum + Number(s.amount) * 0.4, 0) || 0;

  const winningNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 45) + 1);

  const { data: draw } = await supabase
    .from("draws")
    .insert({
      draw_month: drawMonth,
      winningNumbers,
      total_prize_pool: totalPrizePool,
      status: "simulated"
    })
    .select("*")
    .single();

  if (!draw) throw new Error("Failed to create draw");

  // Fetch latest user scores (5 scores max per user)
  const { data: scores } = await supabase
    .from("scores")
    .select("user_id, score")
    .order("score_date", { ascending: false });

  if (!scores) return;

  // Calculate match count for each user
  const userScoresMap = new Map<string, number[]>();
  for (const s of scores) {
    if (!userScoresMap.has(s.user_id)) userScoresMap.set(s.user_id, []);
    const arr = userScoresMap.get(s.user_id)!;
    if (arr.length < 5) arr.push(s.score);
  }

  const winners: any[] = [];

  userScoresMap.forEach((numbers, userId) => {
    let matchCount = numbers.filter(n => draw.winning_numbers.includes(n)).length;
    if (matchCount >= 3) {
      // Determine prize tier
      let prizeAmount = 0;
      if (matchCount === 5) prizeAmount = totalPrizePool * 0.4;
      else if (matchCount === 4) prizeAmount = totalPrizePool * 0.35;
      else if (matchCount === 3) prizeAmount = totalPrizePool * 0.25;

      winners.push({
        draw_id: draw.id,
        user_id: userId,
        match_type: matchCount,
        prize_amount: prizeAmount,
        verification_status: "pending"
      });
    }
  });

  // Insert winners
  if (winners.length > 0) {
    await supabase.from("draw_winners").insert(winners);
  } else {
    // If no 5-match winner, set jackpot rollover flag
    if (totalPrizePool * 0.4 > 0) {
      await supabase.from("draws").update({ is_jackpot_rolled_over: true }).eq("id", draw.id);
    }
  }

  redirect("/admin/draws");
}