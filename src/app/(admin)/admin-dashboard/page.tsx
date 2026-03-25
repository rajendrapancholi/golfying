import { createClient } from "@/lib/supabase/client";


export default async function AdminDashboardPage() {
  const supabase = createClient();

  const { data: totalUsers } = await supabase.from("users").select("*", { count: "exact" });
  const { data: totalDraws } = await supabase.from("draws").select("*", { count: "exact" });
  const { data: totalCharityContributions } = await supabase
    .from("users")
    .select("charity_percentage, subscription_amount");

  const totalCharity = totalCharityContributions?.reduce(
    (sum, u) => sum + (Number(u.subscription_amount) * (Number(u.charity_percentage) / 100)),
    0
  ) || 0;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ul>
        <li>Total Users: {totalUsers?.length || 0}</li>
        <li>Total Draws: {totalDraws?.length || 0}</li>
        <li>Total Charity Contributions: ${totalCharity.toFixed(2)}</li>
      </ul>
    </div>
  );
}