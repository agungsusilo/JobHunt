import type { ApplicationSource, ApplicationStatus } from "./types";

export interface StatusMeta {
  value: ApplicationStatus;
  label: string;
  colorVar: string;
}

// Ordered pipeline: wishlist -> applied -> phone_screen -> interview, then
// terminal outcomes (offer / rejected / withdrawn). Colors reference CSS
// custom properties defined in globals.css (see --stage-* / --status-*).
export const STATUS_OPTIONS: StatusMeta[] = [
  { value: "wishlist", label: "Wishlist", colorVar: "--stage-wishlist" },
  { value: "applied", label: "Applied", colorVar: "--stage-applied" },
  {
    value: "phone_screen",
    label: "Phone Screen",
    colorVar: "--stage-phone-screen",
  },
  { value: "interview", label: "Interview", colorVar: "--stage-interview" },
  { value: "offer", label: "Offer", colorVar: "--status-good" },
  { value: "rejected", label: "Rejected", colorVar: "--status-critical" },
  { value: "withdrawn", label: "Withdrawn", colorVar: "--status-muted" },
];

export const STATUS_LABELS: Record<ApplicationStatus, string> =
  Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s.label])) as Record<
    ApplicationStatus,
    string
  >;

export const KANBAN_STATUSES: ApplicationStatus[] = STATUS_OPTIONS.map(
  (s) => s.value,
);

export interface SourceMeta {
  value: ApplicationSource;
  label: string;
}

export const SOURCE_OPTIONS: SourceMeta[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "company_site", label: "Company site" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
];

export const SOURCE_LABELS: Record<ApplicationSource, string> =
  Object.fromEntries(SOURCE_OPTIONS.map((s) => [s.value, s.label])) as Record<
    ApplicationSource,
    string
  >;
