"use client";

import { logoutAction } from "@/app/actions/auth";

export default function LogoutButton() {
  return (
    <button
      onClick={async () => await logoutAction()}
      className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
    >
      Sign Out
    </button>
  );
}
