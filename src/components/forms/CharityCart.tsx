"use client";

import { useState } from "react";
import { Heart, Check, ChevronRight } from "lucide-react";
import { updateCharitySettings } from "@/app/actions/profile";
import { toast } from "react-hot-toast";

export default function CharityCard({ profile, charity, allCharities }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (percentage: number, charityId: string) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("percentage", percentage.toString());
    formData.append("charityId", charityId);

    const result = await updateCharitySettings(formData);
    if (result.success) {
      toast.success("Impact settings updated!");
      setIsEditing(false);
    } else {
      toast.error("Failed to update");
    }
    setLoading(false);
  };

  return (
    <div className="bg-primary rounded-3xl p-8 text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden group">
      <Heart className="absolute -right-4 -top-4 w-32 h-32 opacity-10" fill="currentColor" />
      
      {!isEditing ? (
        <>
          <h3 className="opacity-70 font-black uppercase text-[10px] tracking-[0.2em]">Selected Charity</h3>
          <p className="text-3xl font-bold mt-2 leading-tight">{charity?.name || "Support a Cause"}</p>
          
          <div className="mt-8 pt-6 border-t border-primary-foreground/20 flex justify-between items-end">
            <div>
              <p className="text-[10px] opacity-70 uppercase font-bold">Your Impact</p>
              <p className="text-2xl font-black">{profile?.charity_percentage || 10}%</p>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-lg font-bold transition-all"
            >
              Change
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-2">
             <h3 className="font-bold">Adjust Your Impact</h3>
             <button onClick={() => setIsEditing(false)} className="text-xs opacity-60">Cancel</button>
          </div>
          
          {/* Percentage Slide */}
          <div className="flex gap-2">
            {[10, 25, 50].map((pct) => (
              <button
                key={pct}
                onClick={() => handleUpdate(pct, profile.selected_charity_id)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                  profile.charity_percentage === pct 
                  ? "bg-white text-primary" 
                  : "bg-white/10 border-white/20 hover:bg-white/20"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Charity List Snippet (Top 3) */}
          <div className="space-y-2 mt-4">
            <p className="text-[10px] uppercase font-black opacity-60">Switch Charity</p>
            {allCharities?.slice(0, 3).map((c: any) => (
              <button
                key={c.id}
                disabled={loading}
                onClick={() => handleUpdate(profile.charity_percentage, c.id)}
                className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left"
              >
                <span className="text-sm font-bold truncate">{c.name}</span>
                {profile.selected_charity_id === c.id ? <Check size={16}/> : <ChevronRight size={16}/>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
