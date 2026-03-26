"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadProof } from "../../actions/uploadProof";
import { Trophy, Upload, CheckCircle, Clock, Eye, Gift } from "lucide-react";

export default function WinningsPage() {
  const supabase = createClient();
  const [winnings, setWinnings] = useState<any[]>([]);
  const [fileMap, setFileMap] = useState<Record<string, File | undefined>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWinnings = async () => {
      const { data } = await supabase
        .from("draw_winners")
        .select("*")
        .order("created_at", { ascending: false });
      setWinnings(data || []);
    };
    fetchWinnings();
  }, [supabase]);

  async function handleUpload(drawWinnerId: string) {
    const selectedFile = fileMap[drawWinnerId];
    if (!selectedFile) return;

    setUploadingId(drawWinnerId);
    try {
      await uploadProof({ drawWinnerId, file: selectedFile });

      // Update local state to reflect 'pending_verification' immediately
      setWinnings((prev) =>
        prev.map((w) =>
          w.id === drawWinnerId
            ? { ...w, verification_status: "pending_verification" }
            : w,
        ),
      );

      setFileMap((prev) => {
        const next = { ...prev };
        delete next[drawWinnerId];
        return next;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="mb-10 text-center md:text-left">
        <div className="inline-flex items-center gap-2 text-primary font-bold mb-2">
          <Gift size={20} />
          <span className="uppercase tracking-widest text-xs">
            Rewards & Prizes
          </span>
        </div>
        <h1 className="text-4xl font-black text-foreground tracking-tight">
          Your Winnings
        </h1>
        <p className="text-muted-foreground mt-2 italic">
          Every win supports your chosen charity. Upload proof to claim your
          reward.
        </p>
      </div>

      {winnings.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-3xl p-16 text-center">
          <Trophy size={48} className="mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground font-medium">
            No prizes recorded yet. Keep playing!
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {winnings.map((win) => (
            <div
              key={win.id}
              className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {/* Left: Prize Info */}
                <div className="flex items-center gap-6">
                  <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                    <Trophy size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-black text-foreground">
                        ${win.prize_amount}
                      </span>
                      <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase">
                        {win.match_type}-Number Match
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      Draw Ref: {win.draw_id.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="w-full md:w-auto flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2">
                    {win.verification_status === "approved" ? (
                      <span className="flex items-center gap-1.5 text-success font-bold text-sm bg-success/10 px-3 py-1.5 rounded-xl">
                        <CheckCircle size={14} /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-warning font-bold text-sm bg-warning/10 px-3 py-1.5 rounded-xl">
                        <Clock size={14} />{" "}
                        {win.verification_status.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  {/* Upload Section */}
                  {win.verification_status === "pending" && (
                    <div className="flex items-center gap-2 w-full">
                      <label className="flex-1 md:flex-none cursor-pointer bg-muted hover:bg-muted/80 p-3 rounded-xl border border-border transition-colors text-center text-xs font-bold">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file)
                              setFileMap((prev) => ({
                                ...prev,
                                [win.id]: file,
                              }));
                          }}
                        />
                        {fileMap[win.id]
                          ? fileMap[win.id]?.name.slice(0, 15)
                          : "Select Proof"}
                      </label>
                      <button
                        onClick={() => handleUpload(win.id)}
                        disabled={!fileMap[win.id] || uploadingId === win.id}
                        className="bg-primary text-primary-foreground p-3 rounded-xl font-bold text-xs disabled:opacity-50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                        {uploadingId === win.id ? (
                          <Clock className="animate-spin" size={14} />
                        ) : (
                          <Upload size={14} />
                        )}
                        Upload
                      </button>
                    </div>
                  )}

                  {/* View Proof Link */}
                  {win.proof_url && (
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proofs/${win.proof_url}`}
                      target="_blank"
                      className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      <Eye size={14} /> View Submitted Proof
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
