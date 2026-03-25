"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function registerAction(
  _prevState: any,
  formData: FormData,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const charityId = formData.get("charityId") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        selected_charity_id: charityId,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }
  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      selected_charity_id: charityId,
    });
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prevState: any,
  formData: FormData,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
