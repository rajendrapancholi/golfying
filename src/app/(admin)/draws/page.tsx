import { runMonthlyDrawAction } from "@/app/actions/draws";
import { createClient } from "@/lib/supabase/client";

import { redirect } from "next/navigation";

export default async function AdminDrawsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const { data: draws } = await supabase
    .from("draws")
    .select("*")
    .order("draw_month", { ascending: false });

  return (
    <div>
      <h1>Draws</h1>

      <form action={runMonthlyDrawAction}>
        <button type="submit">Run Monthly Draw</button>
      </form>

      <h2>All Draws</h2>
      <ul>
        {draws?.map(draw => (
          <li key={draw.id}>
            {new Date(draw.draw_month).toLocaleDateString()} - Status: {draw.status} - Jackpot Rolled: {draw.is_jackpot_rolled_over ? "Yes" : "No"}
          </li>
        ))}
      </ul>
    </div>
  );
}