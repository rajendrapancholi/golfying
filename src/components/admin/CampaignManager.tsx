"use client";

import { toast } from "react-hot-toast";
import { Megaphone, Power } from "lucide-react";
import { toggleCampaign } from "@/app/actions/adminCampaign";

export default function CampaignManager({ campaigns }: { campaigns: any[] }) {
  const handleToggle = async (id: string, currentState: boolean) => {
    const res = await toggleCampaign(id, !currentState);
    if (res.success) toast.success("Campaign updated!");
    else toast.error("Update failed");
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="text-primary" />
        <h2 className="text-xl font-bold">Active Campaigns</h2>
      </div>
      
      <div className="space-y-4">
        {campaigns.map((camp) => (
          <div key={camp.id} className="flex justify-between items-center p-4 bg-muted/30 rounded-2xl border border-border">
            <div>
              <p className="font-bold">{camp.title}</p>
              <p className="text-xs text-muted-foreground">{camp.donation_multiplier}x Charity Impact</p>
            </div>
            <button 
              onClick={() => handleToggle(camp.id, camp.is_active)}
              className={`p-3 rounded-xl transition-all ${camp.is_active ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}
            >
              <Power size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
