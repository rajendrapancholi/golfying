"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function selectCharityAction(formData: FormData) {
  const supabase = await createClient();

  const charityId = formData.get("charity_id") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("users")
    .update({
      charity_id: charityId,
    })
    .eq("id", user.id);

  redirect("/dashboard");
}

// Add or Update Charity
export async function saveCharityAction(formData: FormData) {
  const supabase = await createAdminClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const logoFile = formData.get("logo") as File;
  let logo_url = formData.get("existing_logo_url") as string;

  // --- LOGO UPLOAD LOGIC ---
  if (logoFile && logoFile.size > 0) {
    // Generate a unique file name
    const fileExt = logoFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // Upload to Supabase Storage (Bucket name: 'charity-logos')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("charity-logos")
      .upload(filePath, logoFile);

    if (uploadError)
      return { error: "Logo upload failed: " + uploadError.message };

    // Get the Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("charity-logos").getPublicUrl(filePath);

    logo_url = publicUrl;
  }

  const charityData = { name, description, logo_url };

  if (id && id !== "") {
    // Update existing
    const { error } = await supabase
      .from("charities")
      .update(charityData)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    // Create new
    const { error } = await supabase.from("charities").insert(charityData);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin-charities");
  return { success: true };
}

// Delete Charity
export async function deleteCharityAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("charities").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/charities");
  return { success: true };
}

export async function saveCharityAction2(formData: FormData) {
  const supabase = await createAdminClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const logoFile = formData.get("logo") as File;

  let logoUrl = formData.get("existing_logo_url") as string;

  // Handle Media Upload if a new file is provided
  if (logoFile && logoFile.size > 0) {
    const fileExt = logoFile.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("charity-logos")
      .upload(filePath, logoFile);

    if (uploadError)
      return { error: "Logo upload failed: " + uploadError.message };

    // Get the public URL for the database record
    const {
      data: { publicUrl },
    } = supabase.storage.from("charity-logos").getPublicUrl(filePath);

    logoUrl = publicUrl;
  }

  const charityData = { name, description, logo_url: logoUrl };

  if (id) {
    const { error } = await supabase
      .from("charities")
      .update(charityData)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("charities").insert(charityData);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin-charities");
  return { success: true };
}
