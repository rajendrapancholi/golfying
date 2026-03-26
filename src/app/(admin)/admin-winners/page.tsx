import { createClient } from "@/lib/supabase/server";
import { verifyWinnerAction } from "@/app/actions/adminWinners";
import {
  Check,
  X,
  ExternalLink,
  Image as ImageIcon,
  Clock,
} from "lucide-react";

export default async function AdminWinnersPage() {
  const supabase = await createClient();

  // Fetch Winners
  const { data: winners } = await supabase
    .from("draw_winners")
    .select("*, profiles(full_name, email)")
    .neq("verification_status", "paid")
    .order("created_at", { ascending: false });

  // Pre-generate Signed URLs (Avoids async map issue)
  const winnersWithUrls = await Promise.all(
    (winners || []).map(async (win) => {
      let signedUrl = null;
      if (win.proof_url) {
        const { data } = await supabase.storage
          .from("proofs")
          .createSignedUrl(win.proof_url, 3600); // 1 hour for admin review
        signedUrl = data?.signedUrl;
      }
      return { ...win, signedUrl };
    }),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Winner Verification
          </h1>
          <p className="text-muted-foreground italic mt-1">
            Review proof of play and identity for prize payouts.
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/20 px-4 py-2 rounded-xl text-primary text-xs font-bold flex items-center gap-2">
          <Clock size={14} /> Pending Review: {winnersWithUrls.length}
        </div>
      </header>

      <div className="grid gap-6">
        {winnersWithUrls.map((win) => (
          <div
            key={win.id}
            className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-8 items-start hover:border-primary/20 transition-all"
          >
            {/* Proof Preview (Modern aspect-ratio container) */}
            <div className="w-full md:w-56 aspect-square bg-muted rounded-2xl overflow-hidden border border-border flex items-center justify-center relative group shrink-0">
              {win.signedUrl ? (
                <>
                  <img
                    src={win.signedUrl}
                    alt="Proof"
                    className="w-full h-full object-cover"
                  />
                  <a
                    href={win.signedUrl}
                    target="_blank"
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <ExternalLink size={24} />
                  </a>
                </>
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2 text-center p-4">
                  <ImageIcon
                    size={32}
                    strokeWidth={1.5}
                    className="opacity-20"
                  />
                  <span className="text-[10px] uppercase font-black tracking-widest opacity-50">
                    No Proof Uploaded
                  </span>
                </div>
              )}
            </div>

            {/* Winner Details & Control */}
            <div className="flex-1 w-full space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-foreground">
                    {win.profiles?.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {win.profiles?.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-primary">
                    £{win.prize_amount}
                  </p>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">
                    {win.match_type}-Number Match
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                    win.verification_status === "approved"
                      ? "bg-success/10 text-success"
                      : win.verification_status === "rejected"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                  }`}
                >
                  Current Status: {win.verification_status}
                </span>
              </div>

              {/* Action Bar (PRD: Mark payouts as completed) */}
              <div className="pt-6 border-t border-border flex flex-wrap gap-3">
                <form
                  action={async () => {
                    "use server";
                    await verifyWinnerAction(win.id, "approved");
                  }}
                >
                  <button className="bg-success text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-success/10 cursor-pointer">
                    <Check size={18} strokeWidth={3} /> Approve Payout
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    await verifyWinnerAction(win.id, "rejected");
                  }}
                >
                  <button className="bg-destructive/10 text-destructive border border-destructive/20 px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-destructive/20 transition-all cursor-pointer">
                    <X size={18} strokeWidth={3} /> Reject Claim
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}

        {(!winnersWithUrls || winnersWithUrls.length === 0) && (
          <div className="text-center py-32 bg-muted/10 rounded-4xl border-2 border-dashed border-border group">
            <ImageIcon
              size={48}
              className="mx-auto text-muted-foreground opacity-20 group-hover:scale-110 transition-transform duration-500 mb-4"
            />
            <p className="text-muted-foreground font-bold text-lg tracking-tight">
              All clear!
            </p>
            <p className="text-sm text-muted-foreground/60 italic mt-1">
              No pending winner verifications at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
