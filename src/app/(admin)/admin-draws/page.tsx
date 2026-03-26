"use client";

import { executeMonthlyDraw } from "@/app/actions/draws";
import { useActionState, useState } from "react";
import { Play, Zap, Info } from "lucide-react";

export default function AdminDrawPage() {
  const [results, setResults] = useState<any>(null);
  
  const [state, formAction, isPending] = useActionState(executeMonthlyDraw, null);

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight">Draw Engine</h1>
        <p className="text-muted-foreground italic">Configure logic and execute the monthly prize distribution.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* CONFIGURATION PANEL */}
        <form action={formAction} className="lg:col-span-1 bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Generation Logic</label>
            <div className="grid gap-3">
              <label className="flex items-center gap-3 p-4 border border-border rounded-2xl cursor-pointer hover:bg-muted transition-all has-checked:border-primary has-checked:bg-primary/5">
                <input type="radio" name="logic" value="random" defaultChecked className="accent-primary" />
                <div className="text-sm font-bold">Pure Random <span className="block text-[10px] opacity-60 font-medium">100% Luck-based</span></div>
              </label>
              <label className="flex items-center gap-3 p-4 border border-border rounded-2xl cursor-pointer hover:bg-muted transition-all has-checked:border-primary has-checked:bg-primary/5">
                <input type="radio" name="logic" value="algorithm" className="accent-primary" />
                <div className="text-sm font-bold">Smart Algorithm <span className="block text-[10px] opacity-60 font-medium">Pattern optimized</span></div>
              </label>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <button name="isSimulation" value="true" disabled={isPending} className="w-full bg-muted text-foreground py-4 rounded-2xl font-bold hover:bg-muted/80 transition-all flex items-center justify-center gap-2">
              <Zap size={16} /> Run Simulation
            </button>
            <button name="isSimulation" value="false" disabled={isPending} className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              <Play size={18} /> Publish Live Draw
            </button>
          </div>
        </form>

        {/* RESULTS / SIMULATION VIEW */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-xl">Output Monitor</h3>
            {results?.isSimulation && <span className="bg-warning/10 text-warning text-[10px] font-black px-3 py-1 rounded-full uppercase">Simulation Mode</span>}
          </div>

          {!state?.winningNumbers ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted-foreground italic">
              <Info size={32} className="mb-2 opacity-20" />
              Waiting for execution...
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-300">
              {/* Winning Numbers */}
              <div className="flex gap-3 justify-center">
                {state.winningNumbers.map((n: number, i: number) => (
                  <div key={i} className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-black shadow-inner">
                    {n}
                  </div>
                ))}
              </div>

              {/* Winner List */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Identified Winners ({state.potentialWinners.length})</h4>
                <div className="max-h-48 overflow-y-auto divide-y divide-border border border-border rounded-2xl">
                  {state.potentialWinners.map((w: any, i: number) => (
                    <div key={i} className="p-4 flex justify-between items-center text-sm font-medium">
                      <span>{w.profiles.full_name}</span>
                      <span className="text-primary font-black">Score: {w.score_value}</span>
                    </div>
                  ))}
                  {state.potentialWinners.length === 0 && <p className="p-8 text-center text-muted-foreground italic">No matches found for this draw.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


