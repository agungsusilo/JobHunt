"use client";

import { useState } from "react";
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mencari.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Surf the Internet
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Cari lowongan berdasarkan kata kunci. Hasil di bawah diagregasi
          dari API publik (Arbeitnow, RemoteOK); untuk cakupan lebih luas
          (termasuk LinkedIn/Indeed) pakai tombol pencarian cepat.
        </p>
      </header>

      <form
        onSubmit={handleSearch}
        className="mb-6 flex flex-wrap items-end gap-3"
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
            Kata kunci
          </span>
          <input
            className="input w-64"
            placeholder="e.g. frontend engineer"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
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
          />
          Remote only
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[var(--series-blue)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Mencari..." : "Cari"}
        </button>
      </form>

      <QuickSearchLinks query={query} location={location} remoteOnly={remoteOnly} />

      {error && <p className="text-sm text-[var(--status-critical)]">{error}</p>}

      {submitted && !loading && !error && (
        <p className="mb-3 text-sm text-[var(--text-muted)]">
          {results.length} hasil untuk &quot;{submitted.query || "semua lowongan"}
          &quot;
          {submitted.location && ` di ${submitted.location}`}
          {submitted.remoteOnly && " (remote only)"}
        </p>
      )}

      <div className="space-y-3">
        {results.map((result) => (
          <JobResultCard key={result.id} result={result} />
        ))}
        {submitted && !loading && results.length === 0 && !error && (
          <p className="text-sm text-[var(--text-muted)]">
            Tidak ada hasil dari sumber yang kami agregasi. Coba tombol
            pencarian cepat di atas untuk jangkauan lebih luas.
          </p>
        )}
      </div>
    </div>
  );
}
