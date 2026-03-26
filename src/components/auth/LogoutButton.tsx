"use client";

import { logoutAction } from "@/app/actions/auth";
import toast from "react-hot-toast";
import {useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const loadingToast = toast.loading("Signing out...");
    
    try {
      await logoutAction();
      toast.success("Logged out successfully!", { id: loadingToast });
      router.push("/login")
    } catch (error) {
      toast.error("Failed to sign out. Please try again.", { id: loadingToast });
      console.error("Logout Error:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-5 py-2.5 text-sm font-black uppercase tracking-tight text-destructive border border-border rounded-lg transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive hover:shadow-lg hover:shadow-destructive/10 active:scale-95 cursor-pointer dark:bg-card dark:border-border"
    >
      Sign Out
    </button>
  );
}
