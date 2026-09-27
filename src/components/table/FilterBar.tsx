"use client";

import { STATUS_OPTIONS, SOURCE_OPTIONS } from "@/lib/constants";
import type { ApplicationSource, ApplicationStatus } from "@/lib/types";

export interface Filters {
  search: string;
  status: ApplicationStatus | "all";
  source: ApplicationSource | "all";
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <input
        className="input max-w-xs"
        placeholder="Search company or position..."
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />
      <select
        className="input w-auto"
        value={filters.status}
        onChange={(e) =>
          onChange({
            ...filters,
            status: e.target.value as Filters["status"],
          })
        }
      >
        <option value="all">All statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        className="input w-auto"
        value={filters.source}
        onChange={(e) =>
          onChange({
            ...filters,
            source: e.target.value as Filters["source"],
          })
        }
      >
        <option value="all">All sources</option>
        {SOURCE_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
