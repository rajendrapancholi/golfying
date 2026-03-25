"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function selectCharityAction(formData: FormData) {
  const supabase = await createClient();

  const charityId = formData.get("charity_id") as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("users").update({
    charity_id: charityId
  }).eq("id", user.id);

  redirect("/dashboard");
}