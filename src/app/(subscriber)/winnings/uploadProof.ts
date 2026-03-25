"use server";

import { createClient } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

type UploadProofProps = {
  drawWinnerId: string;
  file: File;
};

export async function uploadProof({ drawWinnerId, file }: UploadProofProps) {
  const supabase = createClient();

  // Upload file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("winner-proofs")
    .upload(`${drawWinnerId}-${file.name}`, file);

  if (uploadError) throw new Error(uploadError.message);

  const fileUrl = supabase.storage.from("winner-proofs").getPublicUrl(uploadData.path).data.publicUrl;

  // Update draw_winners table with proof URL
  const { error } = await supabase
    .from("draw_winners")
    .update({ proof_url: fileUrl, verification_status: "pending" })
    .eq("id", drawWinnerId);

  if (error) throw new Error(error.message);

  // Revalidate current page to show updated status
  revalidatePath("/winnings");
}