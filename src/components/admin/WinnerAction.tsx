"use client";

import { useState } from "react";
import { Check, X, ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast"; // or your toast library
import {
  verifyWinnerAction,
  verifyPayoutAction,
} from "@/app/actions/adminWinners";

export default function WinnerActionButtons({
  winId,
  status,
}: {
  winId: string;
  status: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (type: "approved" | "rejected" | "paid") => {
    setLoading(type);
    const toastId = toast.loading(
      type === "paid" ? "Processing payout..." : "Updating status...",
    );

    try {
      const formData = new FormData();
      formData.append("id", winId);
      if (type !== "paid") formData.append("status", type);
      const result =
        type === "paid"
          ? await verifyPayoutAction(formData)
          : await verifyWinnerAction(winId, type);

      if (result?.success) {
        toast.success(
          type === "paid" ? "Winner archived as paid!" : `Winner ${type}!`,
          { id: toastId },
        );
      } else {
        toast.error(result?.error || "Action failed", { id: toastId });
      }
    } catch (err) {
      toast.error("Something went wrong", { id: toastId });
    } finally {
      setLoading(null);
    }
  };

  if (status === "approved") {
    return (
      <button
        disabled={!!loading}
        onClick={() => handleAction("paid")}
        className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 cursor-pointer disabled:opacity-50"
      >
        <ImageIcon size={24} />{" "}
        {loading === "paid" ? "Archiving..." : "Mark as Paid & Archive"}
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        disabled={!!loading}
        onClick={() => handleAction("approved")}
        className="bg-success text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-success/10 cursor-pointer disabled:opacity-50"
      >
        <Check size={18} strokeWidth={3} />{" "}
        {loading === "approved" ? "Approving..." : "Approve Payout"}
      </button>

      <button
        disabled={!!loading}
        onClick={() => handleAction("rejected")}
        className="bg-destructive/10 text-destructive border border-destructive/20 px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-destructive/20 transition-all cursor-pointer disabled:opacity-50"
      >
        <X size={18} strokeWidth={3} />{" "}
        {loading === "rejected" ? "Rejecting..." : "Reject Claim"}
      </button>
    </div>
  );
}
