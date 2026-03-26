"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function executeMonthlyDraw(
  _previousState:
    | { error: string; success?: undefined }
    | { success: boolean; error?: undefined }
    | null,
  formData: FormData,
) {
  const supabase = await createAdminClient();
  const logic = formData.get("logic") as string; // 'random' or 'algorithm'
  const isSimulation = formData.get("isSimulation") === "true";

  // Generate 6 Unique Random Numbers (1-59)
  let winningNumbers: number[] = [];
  if (logic === "algorithm") {
    while (winningNumbers.length < 6) {
      const num = Math.floor(Math.random() * 59) + 1;
      if (!winningNumbers.includes(num)) winningNumbers.push(num);
    }
  } else {
    // Pure Random Logic
    winningNumbers = Array.from(
      { length: 6 },
      () => Math.floor(Math.random() * 59) + 1,
    );
  }
  winningNumbers.sort((a, b) => a - b);

  // Insert the record
  const { data: draw, error: drawError } = await supabase
    .from("draws")
    .insert({
      winning_numbers: winningNumbers,
      status: "pending",
    })
    .select()
    .single();

  if (drawError) {
    console.error("Error: ", drawError);
    return { error: "Failed to initialize draw." };
  }

  const { data: eligibleScores } = await supabase
    .from("scores")
    .select("*, profiles!inner(id, subscription_status)")
    .eq("profiles.subscription_status", "active");

  const winners: any[] = [];
  eligibleScores?.forEach((score) => {
    // Check if the user's Stableford score (1-45) matches any winning number
    if (winningNumbers.includes(score.score_value)) {
      winners.push({
        draw_id: draw.id,
        user_id: score.user_id,
        score_id: score.id,
        prize_amount: 1000, // Example fixed prize; can be dynamic
        verification_status: "pending",
      });
    }
  });

  // Record Winners & Update Draw Status
  if (winners.length > 0) {
    await supabase.from("draw_winners").insert(winners);
  }

  await supabase
    .from("draws")
    .update({ status: "completed" })
    .eq("id", draw.id);

  revalidatePath("/admin/draws");
  return {
    success: true,
    winningNumbers: winningNumbers,
    potentialWinners: winners || [],
    winnerCount: winners.length,
    isSimulation: isSimulation,
  };
}
