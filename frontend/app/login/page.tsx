"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let token: string;
      if (mode === "login") {
        token = await login(email, password);
      } else {
        if (name.trim().length < 2) {
          setError("Name must be at least 2 characters.");
          setLoading(false);
          return;
        }
        token = await register(name, email, password);
      }
      localStorage.setItem("token", token);
      router.push("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg flex min-h-screen items-center justify-center p-4">
      <div className="auth-card w-full max-w-md">
        {/* Logo / Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg">
            <svg
              className="h-9 w-9 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-800">
            Smart Traffic System
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time intelligence for smarter cities
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              mode === "login"
                ? "bg-white text-sky-700 shadow"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(null); }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              mode === "register"
                ? "bg-white text-sky-700 shadow"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="auth-label">Full Name</label>
              <input
                type="text"
                required
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
              />
            </div>
          )}

          <div>
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />
          </div>

          <div>
            <label className="auth-label">Password</label>
            <input
              type="password"
              required
              minLength={8}
              placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-btn"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="auth-spinner" />
                {mode === "login" ? "Signing in…" : "Creating account…"}
              </span>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {mode === "login" && (
          <div className="mt-4 rounded-lg bg-sky-50 p-3 text-xs text-sky-700">
            <strong>Demo admin:</strong> admin@traffic.local / Admin@12345
          </div>
        )}
      </div>
    </div>
  );
}
