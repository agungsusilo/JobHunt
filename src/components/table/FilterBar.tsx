"use client";

import { Search } from "lucide-react";
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
      <div className="relative max-w-xs flex-1">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          className="input pl-9"
          placeholder="Search company or position..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
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
