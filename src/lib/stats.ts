import { KANBAN_STATUSES } from "./constants";
import type { Application, ApplicationStatus } from "./types";

export interface ApplicationStats {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  activeCount: number;
  responseRate: number | null;
}

const ACTIVE_STATUSES: ApplicationStatus[] = [
  "applied",
  "phone_screen",
  "interview",
];

const RESPONDED_STATUSES: ApplicationStatus[] = [
  "phone_screen",
  "interview",
  "offer",
  "rejected",
];

export function computeStats(applications: Application[]): ApplicationStats {
  const byStatus = Object.fromEntries(
    KANBAN_STATUSES.map((status) => [status, 0]),
  ) as Record<ApplicationStatus, number>;

  for (const app of applications) {
    byStatus[app.status] += 1;
  }

  const activeCount = ACTIVE_STATUSES.reduce(
    (sum, status) => sum + byStatus[status],
    0,
  );

  const appliedTotal = applications.filter(
    (a) => a.status !== "wishlist",
  ).length;
  const respondedTotal = RESPONDED_STATUSES.reduce(
    (sum, status) => sum + byStatus[status],
    0,
  );
  const responseRate =
    appliedTotal > 0 ? Math.round((respondedTotal / appliedTotal) * 100) : null;

  return {
    total: applications.length,
    byStatus,
    activeCount,
    responseRate,
  };
}
