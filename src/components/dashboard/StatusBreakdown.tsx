import { BarChart3 } from "lucide-react";
import { STATUS_OPTIONS } from "@/lib/constants";
import type { ApplicationStats } from "@/lib/stats";

interface StatusBreakdownProps {
  stats: ApplicationStats;
}

export function StatusBreakdown({ stats }: StatusBreakdownProps) {
  const max = Math.max(1, ...STATUS_OPTIONS.map((s) => stats.byStatus[s.value]));

  return (
    <div className="card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
        <BarChart3 size={16} className="text-[var(--text-muted)]" />
        Breakdown per status
      </h2>
      <div className="space-y-3">
        {STATUS_OPTIONS.map((meta) => {
          const count = stats.byStatus[meta.value];
          const width = stats.total === 0 ? 0 : (count / max) * 100;
          return (
            <div key={meta.value} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-xs text-[var(--text-secondary)]">
                {meta.label}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--page-plane)]">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
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
