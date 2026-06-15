"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Feil passord");
      }
    } catch {
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-sand-200 bg-white p-7 shadow-sm"
      >
        <h1 className="mb-1 text-xl font-semibold text-bark-900">
          Omtur Vedlikehold
        </h1>
        <p className="mb-6 text-sm text-bark-700">Administrasjon</p>

        <label className="mb-1.5 block text-sm font-medium text-bark-800">
          Passord
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 outline-none focus:border-moss-400 focus:bg-white focus:ring-2 focus:ring-moss-200"
          autoFocus
        />

        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-moss-600 px-6 py-3 font-semibold text-white transition hover:bg-moss-700 disabled:opacity-60"
        >
          {loading ? "Logger inn …" : "Logg inn"}
        </button>
      </form>
    </main>
  );
}
