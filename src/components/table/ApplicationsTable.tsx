"use client";

import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import { FilterBar, type Filters } from "./FilterBar";
import { StatusDropdown } from "./StatusDropdown";
import { SOURCE_LABELS } from "@/lib/constants";
import type { Application, ApplicationStatus } from "@/lib/types";

interface ApplicationsTableProps {
  applications: Application[];
  onRowClick: (app: Application) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}

export function ApplicationsTable({
  applications,
  onRowClick,
  onStatusChange,
}: ApplicationsTableProps) {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    source: "all",
  });

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return applications.filter((a) => {
      if (filters.status !== "all" && a.status !== filters.status) return false;
      if (filters.source !== "all" && a.source !== filters.source) return false;
      if (
        search &&
        !a.company.toLowerCase().includes(search) &&
        !a.position.toLowerCase().includes(search)
      )
        return false;
      return true;
    });
  }, [applications, filters]);

  return (
    <div>
      <FilterBar filters={filters} onChange={setFilters} />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-hairline)] text-left text-xs text-[var(--text-muted)]">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Position</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Applied</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => (
              <tr
                key={app.id}
                onClick={() => onRowClick(app)}
                className="cursor-pointer border-b border-[var(--border-hairline)] last:border-0 hover:bg-[var(--series-blue-soft)]"
              >
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                  {app.company}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">
                  {app.position}
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">
                  {app.location ?? "—"}
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">
                  {SOURCE_LABELS[app.source]}
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">
                  {app.applied_date ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusDropdown
                    value={app.status}
                    onChange={(status) => onStatusChange(app.id, status)}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                    <Inbox size={24} />
                    <span className="text-sm">
                      No applications match these filters.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
