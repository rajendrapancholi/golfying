"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail, mailer } from "@/lib/utils/email";
import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(
  _previousState:
    | { error: string; success?: undefined }
    | { success: boolean; error?: undefined }
    | null,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const charityId = formData.get("charityId") as string;

  // Update both Auth metadata and the Profiles table
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: name },
  });

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: name,
      selected_charity_id: charityId,
    })
    .eq("id", user.id);

  if (authError || profileError) {
    console.log("Error: ", authError || profileError);
    return { error: "Failed to update settings" };
  }

  revalidatePath("/settings");
  return { success: true };
}

// Initial Request (Sends OTP)
export async function updateEmailAction(
  _previousState:
    | { error: string; success?: undefined }
    | { success: boolean; error?: undefined }
    | null,
  formData: FormData,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be logged in to update your password." };
  }

  const newEmail = formData.get("email") as string;
  const currentPassword = formData.get("currentPassword") as string;

  if (!newEmail || !currentPassword || newEmail === user.email) {
    return { error: "Email and password are required!" };
  }

  if (!isValidEmail(newEmail)) {
    return { error: "Please enter a valid email address." };
  }
  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    console.error(signInError.name, signInError.message);
    return { error: "Current password is incorrect." };
  }

  // Generate OTP
  const otp = randomInt(100000, 999999).toString();
  // Store OTP in DB
  const { error: upsertError } = await supabase
    .from("email_change_otps")
    .upsert({
      user_id: user.id,
      new_email: newEmail,
      otp,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 mins
    });

  if (upsertError) {
    console.error("Error: ", upsertError);
    return { error: "Failed to generate OTP." };
  }

  // Send OTP using Nodemailer
  await mailer.sendMail({
    from: `"Golfying" <${process.env.SMTP_USER}>`,
    to: newEmail,
    subject: "🔐 Your Verification Code | Golfying",
    text: `Your Golfying verification code is: ${otp}. It expires in 10 minutes.`,
    html: `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; border-radius: 16px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; overflow: hidden; shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <!-- Header / Branding -->
        <div style="padding: 32px 32px 16px 32px; text-align: center;">
          <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 900; letter-spacing: -0.025em; text-transform: uppercase;">
            Golfying
          </h1>
          <p style="color: #6b7280; font-size: 14px; font-style: italic; margin-top: 4px;">
            Refine your profile. Maximize your impact.
          </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 0 32px 32px 32px; text-align: center;">
          <div style="height: 1px; background-color: #f3f4f6; margin-bottom: 32px;"></div>
          
          <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin-bottom: 8px;">
            Verify your new email
          </h2>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            You requested to update your account email. Use the code below to confirm this change and stay in the loop for the next <b>Monthly Draw</b>.
          </p>

          <!-- OTP Box -->
          <div style="background-color: #f3f4f6; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
            <span style="display: block; font-size: 10px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
              Your One-Time Code
            </span>
            <span style="font-family: monospace; font-size: 36px; font-weight: 900; color: #111827; letter-spacing: 8px;">
              ${otp}
            </span>
          </div>

          <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">
            This code expires in 10 minutes.<br />
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #111827; padding: 24px; text-align: center;">
          <p style="color: #ffffff; font-size: 12px; font-weight: 600; margin: 0;">
            Performance. Charity. Rewards.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 24px;">
        <p style="color: #9ca3af; font-size: 11px;">
          &copy; 2026 Golfying Platform. All rights reserved.
        </p>
      </div>
    </div>
  `,
  });

  return {
    success: true,
    message: "OTP sent to your email.",
    needsOtp: true,
    email: newEmail,
  };
}

// Verification Request (Submits OTP)
export async function verifyEmailOtpAction(
  _prevState: any,
  formData: FormData,
) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const otp = formData.get("otp") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Fetch stored OTP info
  const { data, error } = await supabase
    .from("email_change_otps")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (error || !data) return { error: "OTP not found." };

  if (data.otp !== otp) return { error: "Invalid OTP." };

  if (new Date(data.expires_at) < new Date()) {
    return { error: "OTP has expired." };
  }
  // Update Supabase email
  const { error: updateErr } = await adminClient.auth.admin.updateUserById(
    user.id,
    {
      email: data.new_email,
      email_confirm: true,
      user_metadata: { ...user.user_metadata, email: data.new_email },
    },
  );

  if (updateErr) {
    console.error("Error: ", updateErr);
    return { error: updateErr?.message };
  }

  // Cleanup OTP entry
  await adminClient.from("email_change_otps").delete().eq("user_id", user.id);

  // Force a session refresh so the browser "sees" the change
  await supabase.auth.refreshSession();

  revalidatePath("/settings");

  return { success: true, message: "Email updated successfully!" };
}

export async function updatePasswordAction(
  _previousState:
    | { error: string; success?: undefined }
    | { success: boolean; error?: undefined }
    | null,
  formData: FormData,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be logged in to update your password." };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate inputs
  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required." };
  }

  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters long." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }
  if (currentPassword === newPassword) {
    return {
      error: "New password must be different from your current password.",
    };
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "Current password is incorrect." };
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/settings");
  return { success: true, message: "Password updated successfully!" };
}

export async function forgotPasswordAction(
  _previousState:
    | { error: string; success?: undefined }
    | { success: boolean; error?: undefined }
    | null,
  formData: FormData,
) {
  const supabase = await createClient();

  const forgotEmail = formData.get("forgotEmail") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!forgotEmail || forgotEmail.trim() === "") {
    return { error: "Email address is required." };
  }

  if (forgotEmail !== user?.email) {
    return { error: "Unauthorized." };
  }
  // Validate email format
  if (!isValidEmail(forgotEmail)) {
    return { error: "Please enter a valid email address." };
  }

  // Send password reset email
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(
    forgotEmail,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    },
  );

  if (resetError) {
    return {
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link shortly.",
    };
  }

  return {
    success: true,
    message:
      "If an account exists with this email, you will receive a password reset link shortly.",
  };
}
