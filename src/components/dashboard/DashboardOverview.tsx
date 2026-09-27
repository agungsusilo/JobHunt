"use client";

import Link from "next/link";
import { useApplications } from "@/hooks/useApplications";
import { computeStats } from "@/lib/stats";
import { StatsOverview } from "./StatsOverview";
import { StatusBreakdown } from "./StatusBreakdown";

export function DashboardOverview() {
  const { applications, loading, error } = useApplications();
  const stats = computeStats(applications);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Dashboard
        </h1>
        <div className="flex gap-2">
          <Link
            href="/surf"
            className="rounded-md border border-[var(--border-hairline)] px-3 py-2 text-sm"
          >
            Cari lowongan
          </Link>
          <Link
            href="/board"
            className="rounded-md bg-[var(--series-blue)] px-3 py-2 text-sm font-medium text-white"
          >
            Buka Job Board
          </Link>
        </div>
      </header>

      {loading && <p className="text-sm text-[var(--text-muted)]">Loading…</p>}
      {error && <p className="text-sm text-[var(--status-critical)]">{error}</p>}

      {!loading && !error && (
        <>
          <StatsOverview stats={stats} />
          <StatusBreakdown stats={stats} />
        </>
      )}
    </div>
  );
}
