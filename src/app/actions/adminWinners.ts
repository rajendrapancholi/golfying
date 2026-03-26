"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function approveWinnerAction(formData: FormData) {
  const supabase = await createAdminClient();
  const winnerId = formData.get("winner_id") as string;

  await supabase
    .from("draw_winners")
    .update({ verification_status: "approved" })
    .eq("id", winnerId);

  revalidatePath("/admin-winners");
  redirect("/admin-winners");
}

export async function rejectWinnerAction(formData: FormData) {
  const supabase = await createAdminClient();
  const winnerId = formData.get("winner_id") as string;

  await supabase
    .from("draw_winners")
    .update({ verification_status: "rejected" })
    .eq("id", winnerId);

  redirect("/admin/winners");
}

export async function verifyWinnerAction(
  winnerId: string,
  status: "approved" | "rejected",
) {
  const supabase = await createAdminClient();

  // Verify Admin Role before proceeding
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();
  if (profile?.role !== "admin") return { error: "Unauthorized" };

  const { error } = await supabase
    .from("draw_winners")
    .update({ verification_status: status })
    .eq("id", winnerId);

  if (error) return { error: error.message };

  revalidatePath("/admin/winners");
  return { success: true };
}

export async function verifyPayoutAction(formData: FormData) {
  const supabase = await createAdminClient();
  const winnerId = formData.get("winnerId") as string;

  const { error } = await supabase
    .from("draw_winners")
    .update({
      verification_status: "paid",
      // Optional: Add a payout_date column if you have one
    })
    .eq("id", winnerId);

  if (error) return { error: error.message };

  revalidatePath("/admin-winners");
  return { success: true };
}
