import { STATUS_OPTIONS } from "@/lib/constants";
import type { ApplicationStatus } from "@/lib/types";

interface BadgeProps {
  status: ApplicationStatus;
}

export function StatusBadge({ status }: BadgeProps) {
  const meta = STATUS_OPTIONS.find((s) => s.value === status);
  if (!meta) return null;

  const textColor = status === "withdrawn" ? "#0b0b0b" : "#ffffff";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `var(${meta.colorVar})`, color: textColor }}
    >
      {meta.label}
    </span>
  );
}
