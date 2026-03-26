"use client";

import { useState } from "react";
import { saveCharityAction } from "@/app/actions/charities";
import { X, Upload, Save, Loader2 } from "lucide-react";

export default function EditCharityModal({
  charity,
  onClose,
}: {
  charity: any;
  onClose: () => void;
}) {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const result = await saveCharityAction(formData);
    setIsPending(false);
    if (result?.success) onClose();
    else if (result?.error) alert(result.error);
  }
  const [preview, setPreview] = useState<string | null>(
    charity.logo_url || null,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border w-full max-w-lg rounded-4xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black tracking-tight">Edit Charity</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <input type="hidden" name="id" value={charity?.id ?? ""} />
          <input
            type="hidden"
            name="existing_logo_url"
            value={charity?.logo_url ?? ""}
          />

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
              Charity Name
            </label>
            <input
              name="name"
              defaultValue={charity.name}
              required
              className="w-full bg-muted border-none p-4 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
              Mission Description
            </label>
            <textarea
              name="description"
              defaultValue={charity.description}
              rows={4}
              className="w-full bg-muted border-none p-4 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
              Update Logo (Optional)
            </label>
            <div className="relative group">
              <input
                type="file"
                name="logo"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />
              <div className="w-full bg-muted border-2 border-dashed border-border p-8 rounded-xl flex flex-col items-center justify-center gap-2 group-hover:border-primary/40 transition-colors">
                <Upload size={24} className="text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground italic">
                  Click or drag to replace logo
                </span>
              </div>
            </div>
          </div>

          <button
            disabled={isPending}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Save size={18} /> Update Charity
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
