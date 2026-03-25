import { addScoreAction } from "@/app/actions/scores";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

export default async function ScoresPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: scores } = await supabase
    .from("scores")
    .select("id, score, score_date")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false });

  return (
    <div>
      <h1>Your Latest Scores</h1>

      <form action={addScoreAction}>
        <label>Score (1-45)</label>
        <input name="score" type="number" min={1} max={45} required />

        <label>Date</label>
        <input name="score_date" type="date" required />

        <button type="submit">Add Score</button>
      </form>

      <h2>Recent Scores</h2>
      <ul>
        {scores?.map(score => (
          <li key={score.id}>
            {new Date(score.score_date).toLocaleDateString()} - {score.score}
          </li>
        ))}
      </ul>
    </div>
  );
}