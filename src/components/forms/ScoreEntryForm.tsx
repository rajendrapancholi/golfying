"use client";

import { submitScoreAction } from "@/app/actions/scores";
import { useTransition, useState } from "react";
import { Loader2, PlusCircle, CheckCircle } from "lucide-react";

export default function ScoreEntryForm() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  async function action(formData: FormData) {
    setSuccess(false);
    startTransition(async () => {
      const result = await submitScoreAction(formData);
      if (result?.error) {
        alert(result.error); // Replace with a Toast if you have one
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000); // Reset success state
      }
    });
  }

  return (
    <form
      action={action}
      className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
            <PlusCircle size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-foreground">
              Log Performance
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
              Stableford Format (1-45)
            </p>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 text-success text-xs font-bold animate-in fade-in slide-in-from-right-4">
            <CheckCircle size={14} />
            Round Recorded!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Score Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
            Points Earned
          </label>
          <input
            name="score_value"
            type="number"
            placeholder="e.g. 36"
            min="1"
            max="45"
            required
            className="w-full bg-muted/50 border border-border rounded-xl p-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/30 font-bold text-lg"
          />
        </div>

        {/* Date Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
            Round Date
          </label>
          <input
            name="score_date"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full bg-muted/50 border border-border rounded-xl p-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-end">
          <button
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground h-15 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/10 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Syncing Round...</span>
              </>
            ) : (
              "Post Score"
            )}
          </button>
        </div>
      </div>

      <p className="mt-4 text-[10px] text-center text-muted-foreground italic">
        Every score logged contributes to your rolling average and supports your
        selected cause.
      </p>
    </form>
  );
}
