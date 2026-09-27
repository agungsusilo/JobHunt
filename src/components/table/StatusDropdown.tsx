"use client";

import { STATUS_OPTIONS } from "@/lib/constants";
import type { ApplicationStatus } from "@/lib/types";

interface StatusDropdownProps {
  value: ApplicationStatus;
  onChange: (status: ApplicationStatus) => void;
}

export function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  return (
    <select
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value as ApplicationStatus)}
      className="rounded-md border border-[var(--border-hairline)] bg-[var(--surface-1)] px-2 py-1 text-xs"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
