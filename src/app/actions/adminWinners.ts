"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
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
  const supabaseClient = await createClient();
  const supabase = await createAdminClient();

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) {
    console.error("No user found in auth session");
    return { error: "Not authenticated" };
  }
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Profile Look-up Error:", profileError);
    return { error: "Unauthorized: Profile not found" };
  }

  if (profile.role !== "admin") {
    return { error: "Unauthorized: Not an admin" };
  }

  const { error } = await supabase
    .from("draw_winners") // Must match your page query
    .update({
      verification_status: status,
      payment_status: status === "rejected" ? "cancelled" : "pending",
    })
    .eq("id", winnerId);

  if (error) {
    console.error("Error updating winner: ", error);
    return { error: error.message };
  }

  revalidatePath("/admin-winners");
  return { success: true };
}

export async function verifyPayoutAction(formData: FormData) {
  try {
    const supabase = await createAdminClient();

    const winnerId = formData.get("id") as string;
    console.log("Debug winnerid:", winnerId);
    if (!winnerId) return { error: "No winner ID provided" };

    const { error } = await supabase
      .from("draw_winners")
      .update({
       verification_status: "approved", 
       payment_status: "paid" 
      })
      .eq("id", winnerId);

    if (error) {
      console.error("Error: ", error);
      return { error: "Failed to process payout" };
    }

    revalidatePath("/admin-winners");
    return { success: true };
  } catch (error) {
    console.error("Server Error: ", error);
    return { success: false, error: "Failed to process payout" };
  }
}
