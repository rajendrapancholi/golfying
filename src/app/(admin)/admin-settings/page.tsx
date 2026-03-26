import Settings from "@/components/forms/Settings";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userName = user.user_metadata?.full_name || "User";

  const { data: profile, error: _profileError } = await supabase
    .from("profiles")
    .select(
      "id, role, selected_charity_id, subscription_status, subscription_tier",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Welcome, {userName}!</h2>
        <p className="mt-4 text-muted-foreground">
          We're setting up your account. Please complete your registration.
        </p>
        <button className="mt-4 bg-primary text-white p-2 rounded">
          Complete Profile
        </button>
      </div>
    );
  }
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch all charities info
  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .order("name");

  return (
    <Settings
      profile={{ ...profile, full_name: userName, currEmail: user.email }}
      charities={charities}
      subscription={subscription}
    />
  );
}
