"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";

interface ActionState {
  error: string | null;
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    loginAction, 
    { error: null }
  );

  return (
    <div className="max-w-md mx-auto p-6 mt-10 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Email</label>
          <input 
            name="email" 
            type="email" 
            placeholder="email@example.com" 
            required 
            className="border p-2 rounded focus:ring-2 focus:ring-black outline-none" 
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Password</label>
          <input 
            name="password" 
            type="password" 
            placeholder="••••••••" 
            required 
            className="border p-2 rounded focus:ring-2 focus:ring-black outline-none" 
          />
        </div>

        {/* Server-side Error Display */}
        {state?.error && (
          <p className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
            {state.error}
          </p>
        )}

        <button 
          type="submit" 
          disabled={isPending}
          className="bg-black text-white p-3 rounded font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all"
        >
          {isPending ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-2">
          Don't have an account?{" "}
          <Link href="/register" className="text-black font-bold hover:underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
