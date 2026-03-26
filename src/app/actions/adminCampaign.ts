'use server'

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function toggleCampaign(campaignId: string, isActive: boolean) {
  const supabase = await createAdminClient();

  if (isActive) {
    await supabase.from("campaigns").update({ is_active: false }).neq("id", campaignId);
  }

  const { error } = await supabase
    .from("campaigns")
    .update({ is_active: isActive })
    .eq("id", campaignId);

  if (error) return { error: error.message };
  
  revalidatePath("/admin-settings");
  return { success: true };
}
