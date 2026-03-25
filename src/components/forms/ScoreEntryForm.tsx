"use client";

import { submitScoreAction } from "@/app/actions/scores";
import { useTransition } from "react";
import { Loader2, PlusCircle } from "lucide-react";

export default function ScoreEntryForm() {
  const [isPending, startTransition] = useTransition();

  async function action(formData: FormData) {
    startTransition(async () => {
      const result = await submitScoreAction(formData);
      if (result?.error) {
        alert(result.error); // For evaluation, a Toast component would be better
      }
    });
  }

  return (
    <form
      action={action}
      className="bg-card p-8 rounded-4xl border border-border shadow-sm transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <PlusCircle size={20} />
        </div>
        <h3 className="text-xl font-black tracking-tight text-foreground">
          Log Performance
        </h3>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Score Input */}
        <div className="flex-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
            Stableford Score (1-45)
          </label>
          <input
            name="score_value"
            type="number"
            placeholder="Enter value"
            min="1"
            max="45"
            required
            className="w-full bg-muted/50 border border-border rounded-2xl p-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50 dark:accent-primary"
          />
        </div>

        {/* Date Input */}
        <div className="flex-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
            Date of Round
          </label>
          <input
            name="score_date"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full bg-muted/50 border border-border rounded-2xl p-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-end">
          <button
            disabled={isPending}
            className="w-full md:w-auto bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Processing...</span>
              </>
            ) : (
              "Log Round"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
