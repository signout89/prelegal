"use client";

import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

const inputClass =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signin") await signIn(email, password);
      else await signUp(name, email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const isSignUp = mode === "signup";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-navy">
          Pre<span className="text-accent">legal</span>
        </h1>
        <p className="text-sm text-muted mb-6">Draft legal agreements with AI</p>
        <form onSubmit={submit} className="space-y-3">
          {isSignUp && (
            <input className={inputClass} placeholder="Full name" aria-label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input className={inputClass} type="email" placeholder="Email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input
            className={inputClass}
            type="password"
            placeholder={isSignUp ? "Password (min 8 characters)" : "Password"}
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={isSignUp ? 8 : undefined}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="w-full py-2 rounded-md bg-submit text-white font-medium hover:opacity-90 disabled:opacity-50">
            {isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            setMode(isSignUp ? "signin" : "signup");
            setError("");
          }}
          className="mt-4 text-sm text-brand hover:underline"
        >
          {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
}
