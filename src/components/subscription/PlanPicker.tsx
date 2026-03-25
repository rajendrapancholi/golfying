"use client";
import { createCheckout } from "@/app/actions/stripe";
import { CheckCircle2 } from "lucide-react"; // install lucide-react

export default function PlanPicker() {
  const monthlyAction = createCheckout.bind(null, "monthly");
  const yearlyAction = createCheckout.bind(null, "yearly");
  
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto p-4">
      {/* Monthly Plan */}
      <div className="group relative bg-white border-2 border-slate-100 rounded-3xl p-8 hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl">
        <h3 className="text-xl font-bold text-slate-900">Monthly Impact</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-5xl font-black tracking-tight">£15</span>
          <span className="ml-1 text-slate-500">/month</span>
        </div>
        <p className="mt-4 text-slate-600">Perfect for the regular player making a steady difference.</p>
        
        <ul className="mt-8 space-y-4">
          {["Rolling 5 Score Entry", "Monthly Prize Draw Access", "10% Charity Contribution"].map((feat) => (
            <li key={feat} className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="text-blue-500 w-5 h-5" /> {feat}
            </li>
          ))}
        </ul>

        <button 
          onClick={() => createCheckout("monthly")}
          className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors"
        >
          Select Monthly
        </button>
      </div>

      {/* Yearly Plan - The "Builder" Choice */}
      <div className="group relative bg-slate-900 border-2 border-blue-500 rounded-3xl p-8 shadow-2xl scale-105">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
          Best Impact & Value
        </div>
        <h3 className="text-xl font-bold text-white">Yearly Hero</h3>
        <div className="mt-4 flex items-baseline text-white">
          <span className="text-5xl font-black tracking-tight">£150</span>
          <span className="ml-1 text-slate-400">/year</span>
        </div>
        <p className="mt-4 text-slate-300">Maximize your contribution. Get 2 months free and higher win potential.</p>

        <ul className="mt-8 space-y-4">
          {["All Monthly Features", "Save £30 Yearly", "Priority Winner Verification", "Enhanced Charity Spotlight"].map((feat) => (
            <li key={feat} className="flex items-center gap-3 text-slate-200">
              <CheckCircle2 className="text-blue-400 w-5 h-5" /> {feat}
            </li>
          ))}
        </ul>

        <button 
          onClick={() => createCheckout("yearly")}
          className="mt-8 w-full py-4 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/20"
        >
          Become a Yearly Hero
        </button>
      </div>
    </div>
  );
}
