import { STATUS_OPTIONS } from "@/lib/constants";
import type { ApplicationStats } from "@/lib/stats";

interface StatusBreakdownProps {
  stats: ApplicationStats;
}

export function StatusBreakdown({ stats }: StatusBreakdownProps) {
  const max = Math.max(1, ...STATUS_OPTIONS.map((s) => stats.byStatus[s.value]));

  return (
    <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4">
      <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
        Breakdown per status
      </h2>
      <div className="space-y-2">
        {STATUS_OPTIONS.map((meta) => {
          const count = stats.byStatus[meta.value];
          const width = stats.total === 0 ? 0 : (count / max) * 100;
          return (
            <div key={meta.value} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-xs text-[var(--text-secondary)]">
                {meta.label}
              </span>
              <div className="h-3 flex-1 rounded-full bg-[var(--page-plane)]">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${width}%`,
                    backgroundColor: `var(${meta.colorVar})`,
                  }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs font-medium text-[var(--text-primary)]">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
