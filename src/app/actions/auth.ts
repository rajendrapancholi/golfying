"use server";

import { createClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/utils/email";
import { redirect } from "next/navigation";

export async function registerAction(
  _prevState: any,
  formData: FormData,
): Promise<{ error: string | null }> {
  let targetPath = "/dashboard";
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const charityId = formData.get("charityId") as string;
  const selectedPlan = formData.get("plan") as string;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          selected_charity_id: charityId,
          subscription_tier: selectedPlan,
        },
      },
    });

    if (error) {
      console.error("Error: ");
      return { error: error.message };
    }
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: name,
        subscription_tier: selectedPlan,
        selected_charity_id: charityId,
      });
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "admin") {
        targetPath = "/admin-dashboard";
      }
    }
  } catch (error: any) {
    console.error("Error: ", error);
    return { error: error.message || "Failed to register!" };
  }
  redirect(targetPath);
}

export async function loginAction(
  _prevState: any,
  formData: FormData,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  if (profile?.role === "admin") {
    redirect("/admin-dashboard");
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function forgotPasswordAction(
  _previousState: any,
  formData: FormData
) {
  const supabase = await createClient();
  const forgotEmail = formData.get("forgotEmail") as string;

  if (!forgotEmail || forgotEmail.trim() === "") {
    return { error: "Email address is required." };
  }

  if (!isValidEmail(forgotEmail)) {
    return { error: "Please enter a valid email address." };
  }

  const { error: resetError } = await supabase.auth.resetPasswordForEmail(
    forgotEmail,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    }
  );

  return {
    success: true,
    message: "If an account exists, a reset link has been sent to your email.",
  };
}
