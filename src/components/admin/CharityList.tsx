"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Heart } from "lucide-react";
import { deleteCharityAction } from "@/app/actions/charities";
import EditCharityModal from "./EditCharityModel";

export default function CharityList({ initialCharities }: { initialCharities: any[] }) {
  const [editingCharity, setEditingCharity] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <>
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Charity Curation</h1>
          <p className="text-muted-foreground italic">Manage the causes that define our heroes' impact.</p>
        </div>
        {/* TRIGGER ADD MODAL */}
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-primary/20 cursor-pointer"
        >
          <Plus size={20} /> Add New Cause
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {initialCharities.map((charity) => (
          <div key={charity.id} className="bg-card border border-border rounded-4xl p-8 flex flex-col justify-between group hover:border-primary/40 transition-all shadow-sm">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-muted rounded-3xl overflow-hidden border border-border flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                {charity.logo_url ? (
                  <img src={charity.logo_url} alt={charity.name} className="w-full h-full object-cover" />
                ) : (
                  <Heart size={32} fill="currentColor" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground">{charity.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                  {charity.description}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-8 pt-6 border-t border-border">
              <button 
                onClick={() => setEditingCharity(charity)}
                className="flex-1 bg-muted hover:bg-primary/10 hover:text-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Edit2 size={14} /> Edit Details
              </button>
              
              <button 
                onClick={async () => { if(confirm('Delete this cause?')) await deleteCharityAction(charity.id); }}
                className="bg-destructive/10 text-destructive p-3 rounded-xl hover:bg-destructive hover:text-white transition-all cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RENDER MODAL FOR EDITING */}
      {editingCharity && (
        <EditCharityModal
          charity={editingCharity} 
          onClose={() => setEditingCharity(null)} 
        />
      )}

      {/* RENDER MODAL FOR ADDING (Pass empty object) */}
      {isAdding && (
        <EditCharityModal 
          charity={{ id: "", name: "", description: "", logo_url: "" }} 
          onClose={() => setIsAdding(false)} 
        />
      )}
    </>
  );
}
