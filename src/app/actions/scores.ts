"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addScoreAction(formData: FormData) {
  const supabase = await createClient();

  const score = Number(formData.get("score"));
  const score_date = formData.get("score_date") as string;

  if (!score || score < 1 || score > 45) {
    throw new Error("Score must be between 1 and 45");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Insert new score
  await supabase.from("scores").insert({
    user_id: user.id,
    score,
    score_date
  });

  // Fetch all scores for this user
  const { data: userScores } = await supabase
    .from("scores")
    .select("id, score, score_date")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false });

  // Keep only latest 5 scores
  if (userScores && userScores.length > 5) {
    const scoresToDelete = userScores.slice(5).map(s => s.id);
    await supabase.from("scores").delete().in("id", scoresToDelete);
  }

  redirect("/scores");
}

export async function submitScoreAction(formData: FormData) {
  const supabase = await createClient();
  
  // PRD: Stableford format (1 - 45)
  const scoreValue = parseInt(formData.get("score_value") as string);
  const scoreDate = formData.get("score_date") as string;

  if (isNaN(scoreValue) || scoreValue < 1 || scoreValue > 45) {
    return { error: "Score must be between 1 and 45." };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("scores").insert({
    user_id: user.id,
    score_value: scoreValue,
    score_date: scoreDate || new Date().toISOString().split('T')[0],
  });

  if (error) return { error: error.message };

  // Revalidate to update the dashboard UI instantly
  revalidatePath("/dashboard");
  return { success: true };
}
