"use client";

import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { useApplications } from "@/hooks/useApplications";
import { computeStats } from "@/lib/stats";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatsOverview } from "./StatsOverview";
import { StatusBreakdown } from "./StatusBreakdown";

export function DashboardOverview() {
  const { applications, loading, error } = useApplications();
  const stats = computeStats(applications);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Ringkasan progres pencarian kerja kamu.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/surf" className="btn-secondary">
            <Search size={15} />
            Cari lowongan
          </Link>
          <Link href="/board" className="btn-primary">
            Buka Job Board
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {loading && <LoadingState />}
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
