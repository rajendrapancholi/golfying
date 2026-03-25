"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function approveWinnerAction(formData: FormData) {
  const supabase = await createClient();
  const winnerId = formData.get("winner_id") as string;

  await supabase.from("draw_winners").update({ verification_status: "approved" }).eq("id", winnerId);

  redirect("/admin/winners");
}

export async function rejectWinnerAction(formData: FormData) {
  const supabase = await createClient();
  const winnerId = formData.get("winner_id") as string;

  await supabase.from("draw_winners").update({ verification_status: "rejected" }).eq("id", winnerId);

  redirect("/admin/winners");
}