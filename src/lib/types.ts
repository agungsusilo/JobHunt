export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type ApplicationSource =
  | "linkedin"
  | "company_site"
  | "referral"
  | "other";

export interface Application {
  id: string;
  company: string;
  position: string;
  job_url: string | null;
  location: string | null;
  source: ApplicationSource;
  status: ApplicationStatus;
  salary_min: number | null;
  salary_max: number | null;
  applied_date: string | null;
  next_action: string | null;
  next_action_date: string | null;
  notes: string | null;
  contact_name: string | null;
  contact_info: string | null;
  created_at: string;
  updated_at: string;
}

export type ApplicationDraft = Omit<
  Application,
  "id" | "created_at" | "updated_at"
>;

export type ApplicationInput = Partial<ApplicationDraft> &
  Pick<ApplicationDraft, "company" | "position">;
