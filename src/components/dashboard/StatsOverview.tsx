import type { ApplicationStats } from "@/lib/stats";

interface StatsOverviewProps {
  stats: ApplicationStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const tiles: { label: string; value: string | number }[] = [
    { label: "Total applications", value: stats.total },
    { label: "Active pipeline", value: stats.activeCount },
    { label: "Offers", value: stats.byStatus.offer },
    {
      label: "Response rate",
      value: stats.responseRate === null ? "—" : `${stats.responseRate}%`,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4"
        >
          <p className="text-2xl font-semibold text-[var(--text-primary)]">
            {tile.value}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{tile.label}</p>
        </div>
      ))}
    </div>
  );
}
