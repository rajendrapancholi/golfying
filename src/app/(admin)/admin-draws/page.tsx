"use client";

import { executeMonthlyDraw } from "@/app/actions/draws";
import { useActionState, useEffect, useState } from "react";
import { Play, Zap, Info } from "lucide-react";

export default function AdminDrawPage() {
  const [state, formAction, isPending] = useActionState(
    executeMonthlyDraw,
    null,
  );
  const [clickedAction, setClickedAction] = useState<"sim" | "live" | null>(
    null,
  );

  useEffect(() => {
    if (!isPending) {
      setClickedAction(null);
    }
  }, [isPending]);

  const handleSubmit = (formData: FormData) => {
    formAction(formData);
    console.log("Debug clickedAction: ", clickedAction);
  };
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight">Draw Engine</h1>
        <p className="text-muted-foreground italic">
          Configure logic and execute the monthly prize distribution.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* CONFIGURATION PANEL */}
        <form
          action={handleSubmit}
          className="lg:col-span-1 bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm"
        >
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Generation Logic
            </label>
            <div className="grid gap-3">
              <label className="flex items-center gap-3 p-4 border border-border rounded-2xl cursor-pointer hover:bg-muted transition-all has-checked:border-primary has-checked:bg-primary/5">
                <input
                  type="radio"
                  name="logic"
                  value="random"
                  defaultChecked
                  className="accent-primary"
                />
                <div className="text-sm font-bold">
                  Pure Random{" "}
                  <span className="block text-[10px] opacity-60 font-medium">
                    100% Luck-based
                  </span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border border-border rounded-2xl cursor-pointer hover:bg-muted transition-all has-checked:border-primary has-checked:bg-primary/5">
                <input
                  type="radio"
                  name="logic"
                  value="algorithm"
                  className="accent-primary"
                />
                <div className="text-sm font-bold">
                  Smart Algorithm{" "}
                  <span className="block text-[10px] opacity-60 font-medium">
                    Pattern optimized
                  </span>
                </div>
              </label>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Target Region
              </label>
              <select
                name="region"
                className="w-full bg-muted border border-border rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="GB">United Kingdom (GBP)</option>
                <option value="US">United States (USD)</option>
                <option value="IN">India (INR)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            {/* SIMULATION BUTTON */}
            <button
              name="isSimulation"
              value="true"
              disabled={isPending}
              onClick={() => setClickedAction("sim")}
              className="w-full bg-muted text-foreground py-4 rounded-2xl font-bold hover:bg-muted/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && clickedAction === "sim" ? (
                <span className="flex items-center gap-2 animate-pulse">
                  <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                  Simulating...
                </span>
              ) : (
                <>
                  <Zap size={16} /> Run Simulation
                </>
              )}
            </button>

            {/* PUBLISH BUTTON */}
            <button
              name="isSimulation"
              value="false"
              disabled={isPending}
              onClick={() => setClickedAction("live")}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
              {isPending && clickedAction === "live" ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Publishing...
                </span>
              ) : (
                <>
                  <Play size={18} /> Publish Live Draw
                </>
              )}
            </button>
          </div>
        </form>

        {/* RESULTS / SIMULATION VIEW */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-xl">Output Monitor</h3>
            {state?.isSimulation && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border border-amber-200">
                Simulation Mode
              </span>
            )}
          </div>

          {!state?.winningNumbers ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted-foreground italic bg-muted/20">
              <Info size={32} className="mb-2 opacity-20" />
              Waiting for execution...
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Winning Numbers */}
              <div className="flex gap-4 justify-center">
                {state.winningNumbers.map((n: number, i: number) => (
                  <div
                    key={i}
                    className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-black shadow-xl shadow-primary/20 rotate-3 even:-rotate-3 transition-transform hover:rotate-0"
                  >
                    {n}
                  </div>
                ))}
              </div>

              {/* Financial Summary*/}
              <div className="grid grid-cols-3 gap-4 bg-muted/50 p-6 rounded-3xl border border-border">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">
                    Total Pool
                  </p>
                  <p className="text-xl font-black text-primary">
                    ${state.stats?.totalPool?.toFixed(2)}
                  </p>
                </div>
                <div className="text-center border-x border-border">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">
                    Winners
                  </p>
                  <p className="text-xl font-black">
                    {(state.stats?.winners?.match5?.length || 0) +
                      (state.stats?.winners?.match4?.length || 0) +
                      (state.stats?.winners?.match3?.length || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">
                    Next Rollover
                  </p>
                  <p className="text-xl font-black text-destructive">
                    ${state.stats?.newRollover?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Tier Breakdown */}
              <div className="grid gap-3">
                {[
                  {
                    label: "5-Match (40%)",
                    data: state.stats?.winners?.match5 || [],
                    prize: state.stats?.prizes?.tier5 || 0,
                  },
                  {
                    label: "4-Match (35%)",
                    data: state.stats?.winners?.match4 || [],
                    prize: state.stats?.prizes?.tier4 || 0,
                  },
                  {
                    label: "3-Match (25%)",
                    data: state.stats?.winners?.match3 || [],
                    prize: state.stats?.prizes?.tier3 || 0,
                  },
                ].map((tier, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex justify-between items-center bg-card border border-border rounded-2xl"
                  >
                    <div>
                      <span className="text-[10px] font-black uppercase text-muted-foreground block">
                        {tier.label}
                      </span>
                      <span className="font-bold">
                        {tier.data.length} Winners{" "}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase text-muted-foreground block">
                        Individual Prize
                      </span>
                      <span className="font-black text-emerald-600">
                        ${tier.prize?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
