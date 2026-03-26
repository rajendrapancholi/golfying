"use server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function adminUpdateUser(_prevState: any, formData: FormData) {
  const full_name = formData.get("full_name") as string;
  const charityId = formData.get("charityId") as string;
  const userId = formData.get("userId") as string;
  const adminClient = await createAdminClient();

  const { error } = await adminClient
    .from("profiles")
    .update({ full_name, selected_charity_id: charityId })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin-users");
  revalidatePath(`/admin-users/${userId}`);
  return { success: true };
}

export async function adminDeleteScore(_prevState: any, formData: FormData) {
  const scoreId = formData.get("scoreId") as string;
  const supabase = await createClient();
  const { error } = await supabase.from("scores").delete().eq("id", scoreId);

  if (error) return { error: error.message };

  revalidatePath("/admin-users");
  return { success: true };
}

export async function toggleUserStatus(_prevState: any, formData: FormData) {
  const currentStatus = formData.get("currentStatus") as string;
  const userId = formData.get("userId") as string;

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: !currentStatus })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function cancelUserSubscription(
  _prevState: any,
  formData: FormData,
) {
  try {
    const subscriptionId = formData.get("subscriptionId") as string;
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function adminUpdateSubscription(
  _prevState: any,
  formData: FormData,
) {
  const supabase = await createClient();
  const userId = formData.get("userId") as string;
  const tier = formData.get("tier") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_tier: tier,
      subscription_status: tier === "paid" ? "active" : "inactive",
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath(`/admin-users/${userId}`);
  return { success: true };
}
