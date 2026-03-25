"use client";
import { useEffect, useState } from "react";

import { uploadProof } from "./uploadProof";
import { createClient } from "@/lib/supabase/client";
import { DrawWinner } from "@/types/supabase.types";

export default function WinningsPage() {
  const supabase = createClient();
  const [winnings, setWinnings] = useState<DrawWinner[]>([]);
  const [fileMap, setFileMap] = useState<Record<string, File | undefined>>({});

  useEffect(() => {
    supabase
      .from("draw_winners")
      .select("*")
      .then(({ data }) => setWinnings(data || []));
  }, []);

  async function handleUpload(drawWinnerId: string) {
    const selectedFile = fileMap[drawWinnerId];
    if (!selectedFile) return alert("Select a file first");

    await uploadProof({ drawWinnerId, file: selectedFile });
    alert("Proof uploaded! Await admin verification.");

    // Clear the specific ID correctly
    setFileMap((prev) => {
      const next = { ...prev };
      delete next[drawWinnerId]; // Physically removing the key is cleaner
      return next;
    });
  }

  return (
    <div>
      <h2>Your Winnings</h2>
      {winnings.length === 0 && <p>No winnings yet</p>}

      {winnings.map((win) => (
        <div
          key={win.id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <p>Draw ID: {win.draw_id}</p>
          <p>Match Type: {win.match_type}-number</p>
          <p>Prize Amount: ${win.prize_amount}</p>
          <p>Status: {win.verification_status}</p>
          {win.verification_status === "pending" && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFileMap((prev) => ({ ...prev, [win.id]: file }));
                  }
                }}
              />
              <button onClick={() => handleUpload(win.id)}>Upload Proof</button>
            </>
          )}
          {win.verification_status === "approved" && win.proof_url && (
            <p>
              Proof Verified:{" "}
              <a href={win.proof_url} target="_blank">
                View
              </a>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
