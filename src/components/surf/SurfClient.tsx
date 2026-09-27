"use client";

import { useState } from "react";
import { Search, Loader2, SearchX } from "lucide-react";
import { QuickSearchLinks } from "./QuickSearchLinks";
import { JobResultCard } from "./JobResultCard";
import type { JobSearchResult } from "@/lib/jobSearch";

export function SurfClient() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [submitted, setSubmitted] = useState<{
    query: string;
    location: string;
    remoteOnly: boolean;
  } | null>(null);
  const [results, setResults] = useState<JobSearchResult[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted({ query, location, remoteOnly });
    try {
      const params = new URLSearchParams({ q: query, location });
      if (remoteOnly) params.set("remote", "true");
      const res = await fetch(`/api/search-jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil hasil pencarian.");
      const data = await res.json();
      setResults(data.results);
      setTotalAvailable(data.totalAvailable ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mencari.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Surf the Internet
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Cari lowongan berdasarkan kata kunci. Hasil di bawah diagregasi
          dari API publik (Arbeitnow, RemoteOK); untuk cakupan lebih luas
          (termasuk LinkedIn/Indeed) pakai tombol pencarian cepat.
        </p>
      </header>

      <form onSubmit={handleSearch} className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
            Kata kunci
          </span>
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              className="input w-64 pl-9"
              placeholder="e.g. frontend engineer"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
            Lokasi
          </span>
          <input
            className="input w-48"
            placeholder="e.g. Jakarta"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="h-4 w-4 accent-[var(--series-blue)]"
          />
          Remote only
        </label>
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          {loading ? "Mencari..." : "Cari"}
        </button>
      </form>

      <QuickSearchLinks query={query} location={location} remoteOnly={remoteOnly} />

      {error && <p className="text-sm text-[var(--status-critical)]">{error}</p>}

      {submitted && !loading && !error && results.length > 0 && (
        <p className="mb-3 text-sm text-[var(--text-muted)]">
          {results.length} hasil untuk &quot;{submitted.query || "semua lowongan"}
          &quot;
          {submitted.location && ` di ${submitted.location}`}
          {submitted.remoteOnly && " (remote only)"}
          <span> &middot; dari {totalAvailable} lowongan yang kami index</span>
        </p>
      )}

      <div className="space-y-3">
        {results.map((result) => (
          <JobResultCard key={result.id} result={result} />
        ))}
        {submitted && !loading && results.length === 0 && !error && (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <SearchX size={24} className="text-[var(--text-muted)]" />
            <div className="max-w-md space-y-1.5">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Tidak ada lowongan yang cocok untuk &quot;{submitted.query}&quot;
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Ini bukan error — dua sumber gratis yang kami agregasi
                (Arbeitnow + RemoteOK) saat ini cuma berisi sekitar{" "}
                {totalAvailable} lowongan aktif, kebanyakan software
                engineering umum & berbasis Eropa/remote. Untuk kata kunci
                spesifik (mis. peran QA/testing, atau lokasi Indonesia),
                kemungkinan besar tidak ada listing yang cocok di sana.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Klik salah satu tombol pencarian cepat di atas untuk hasil
                dari LinkedIn, Indeed, Glassdoor, atau Google Jobs — cakupan
                jauh lebih luas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
