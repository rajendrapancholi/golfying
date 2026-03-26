import { LucideIcon } from "lucide-react";

interface StatusButtonProps {
  pending: boolean;
  pendingMessage?: string;
  buttonText: string;
  icon: LucideIcon; 
}

export default function StatusButton({
  pending,
  pendingMessage = "Syncing",
  buttonText,
  icon: Icon 
}: StatusButtonProps) {
  return (
    <button
      disabled={pending}
      className="w-full md:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          {pendingMessage}...
        </span>
      ) : (
        <>
          <Icon size={18} strokeWidth={3} /> {buttonText}
        </>
      )}
    </button>
  );
}
