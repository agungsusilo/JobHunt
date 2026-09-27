import { Briefcase, Activity, Award, TrendingUp } from "lucide-react";
import type { ApplicationStats } from "@/lib/stats";

interface StatsOverviewProps {
  stats: ApplicationStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const tiles = [
    {
      label: "Total applications",
      value: stats.total,
      icon: Briefcase,
      color: "var(--series-blue)",
    },
    {
      label: "Active pipeline",
      value: stats.activeCount,
      icon: Activity,
      color: "var(--stage-interview)",
    },
    {
      label: "Offers",
      value: stats.byStatus.offer,
      icon: Award,
      color: "var(--status-good)",
    },
    {
      label: "Response rate",
      value: stats.responseRate === null ? "—" : `${stats.responseRate}%`,
      icon: TrendingUp,
      color: "var(--status-critical)",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <div
            key={tile.label}
            className="card p-4 transition-shadow hover:shadow-md"
          >
            <div
              className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: `color-mix(in srgb, ${tile.color} 15%, transparent)` }}
            >
              <Icon size={18} color={tile.color} strokeWidth={2.25} />
            </div>
            <p className="text-2xl font-semibold text-[var(--text-primary)]">
              {tile.value}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{tile.label}</p>
          </div>
        );
      })}
    </div>
  );
}
