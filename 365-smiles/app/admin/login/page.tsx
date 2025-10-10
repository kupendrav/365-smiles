"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function AdminLogin() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErr(error.message || "Unable to sign in. Please try again.");
      return;
    }
    router.push("/admin/frontpage");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Video */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-black/10 pointer-events-none" />
          <video
            src="/hand.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
          {/* overlay label */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-sm text-white/80">Secure Admin Access</p>
            <h2 className="text-lg font-semibold">365 Smiles Console</h2>
          </div>
        </div>

        {/* Right Card: Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-6 md:p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Admin Login</h1>
            <p className="text-white/70 mt-1 text-sm">
              Sign in with the registered admin email and password.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block">
              <span className="block text-sm mb-1">Admin Email</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="admin@365smiles.org"
              />
            </label>

            <label className="block">
              <span className="block text-sm mb-1">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="••••••••"
              />
            </label>

            {err && (
              <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-400/30 rounded-lg px-3 py-2">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-fuchsia-600 py-2.5 font-semibold hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* small footer */}
          <div className="mt-6 text-center text-xs text-white/60">
            Protected area. Authorized personnel only.
          </div>
        </div>
      </div>
    </div>
  );
}
