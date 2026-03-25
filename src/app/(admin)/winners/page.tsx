
import { approveWinnerAction, rejectWinnerAction } from "@/app/actions/adminWinners";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";


export default async function AdminWinnersPage() {
  const supabase = createClient();
  const { data: winners } = await supabase
    .from("draw_winners")
    .select("id, user_id, draw_id, match_type, prize_amount, verification_status, proof_url");

  return (
    <div>
      <h1>Winner Verification</h1>
      <ul>
        {winners?.map(w => (
          <li key={w.id}>
            User: {w.user_id} | Draw: {w.draw_id} | Match: {w.match_type}-number | Prize: ${w.prize_amount} | Status: {w.verification_status}
            <br />
            <a href={w.proof_url} target="_blank">View Proof</a>
            {w.verification_status === "pending" && (
              <div>
                <form action={approveWinnerAction}>
                  <input type="hidden" name="winner_id" value={w.id} />
                  <button type="submit">Approve</button>
                </form>
                <form action={rejectWinnerAction}>
                  <input type="hidden" name="winner_id" value={w.id} />
                  <button type="submit">Reject</button>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}