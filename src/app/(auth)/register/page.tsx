"use client";

import { registerAction } from "@/app/actions/auth";
import { useActionState } from "react";

interface ActionState {
  error: string | null;
}

export default function RegisterPage() {

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    registerAction, 
    { error: null }
  );
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create account</h1>

      <form action={formAction} className="flex flex-col gap-3">
        <input name="name" placeholder="Name" required className="border p-2 rounded" />
        <input name="email" type="email" placeholder="Email" required className="border p-2 rounded" />
        <input name="password" type="password" placeholder="Password" required className="border p-2 rounded" />
        
        <select name="charityId" required className="border p-2 rounded">
          <option value="">Select a Charity</option>
          <option value="cancer-research">Cancer Research</option>
        </select>

        {state?.error && (
          <p className="text-red-500 text-sm">{state.error}</p>
        )}

        <button 
          type="submit" 
          disabled={isPending}
          className="bg-black text-white p-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
        >
          {isPending ? "Creating Account..." : "Register"}
        </button>
      </form>
    </div>
  );
}
