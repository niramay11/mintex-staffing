"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PortalLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/portal/me")
      .then(r => { if (r.ok) router.replace("/portal/dashboard"); })
      .finally(() => setChecking(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);

    const res = await fetch("/api/portal/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Login failed"); return; }
    router.push("/portal/dashboard");
  };

  if (checking) return <div className="min-h-screen bg-gray-950" />;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/logo.svg" alt="Mintex Staffing" width={160} height={48} className="brightness-0 invert" />
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Client Portal</h1>
          <p className="text-gray-400 text-sm mb-7">Sign in to view your jobs and candidates</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Username</label>
              <input
                type="text" required value={username} onChange={e => setUsername(e.target.value)}
                placeholder="your_username" autoComplete="username"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:outline-none text-sm transition-colors"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-800 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-6">
            Credentials are provided by your Mintex account manager
          </p>
        </div>
      </div>
    </div>
  );
}
