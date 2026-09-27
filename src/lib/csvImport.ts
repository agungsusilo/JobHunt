import Papa from "papaparse";
import type { ApplicationInput } from "./types";

export type MappableField =
  | "company"
  | "position"
  | "job_url"
  | "location"
  | "applied_date"
  | "notes"
  | "salary_min"
  | "salary_max"
  | "contact_name"
  | "contact_info";

export const MAPPABLE_FIELDS: { field: MappableField; label: string; required: boolean }[] = [
  { field: "company", label: "Company", required: true },
  { field: "position", label: "Position", required: true },
  { field: "job_url", label: "Job URL", required: false },
  { field: "location", label: "Location", required: false },
  { field: "applied_date", label: "Applied date", required: false },
  { field: "salary_min", label: "Salary (min)", required: false },
  { field: "salary_max", label: "Salary (max)", required: false },
  { field: "contact_name", label: "Contact name", required: false },
  { field: "contact_info", label: "Contact info", required: false },
  { field: "notes", label: "Notes", required: false },
];

const FIELD_ALIASES: Record<MappableField, string[]> = {
  company: ["company", "company name", "employer", "organization", "org"],
  position: ["position", "title", "job title", "role", "job"],
  job_url: ["job url", "url", "link", "job link", "posting url", "job posting url"],
  location: ["location", "job location", "city"],
  applied_date: [
    "applied date",
    "applied on",
    "date applied",
    "application date",
    "saved date",
    "date",
  ],
  salary_min: ["salary min", "salary from", "salary low"],
  salary_max: ["salary max", "salary to", "salary high"],
  contact_name: ["contact", "contact name", "recruiter"],
  contact_info: ["contact info", "contact email", "email"],
  notes: ["notes", "note", "comments", "description", "job description"],
};

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          headers: results.meta.fields ?? [],
          rows: results.data,
        });
      },
      error: (err: Error) => reject(err),
    });
  });
}

// Best-guess header -> field mapping. Each header can only be consumed once.
export function guessColumnMapping(
  headers: string[],
): Partial<Record<MappableField, string>> {
  const mapping: Partial<Record<MappableField, string>> = {};
  const usedHeaders = new Set<string>();
  const normalizedHeaders = headers.map((h) => ({
    original: h,
    normalized: normalizeHeader(h),
  }));

  // Pass 1: exact alias match.
  for (const { field, } of MAPPABLE_FIELDS) {
    const aliases = FIELD_ALIASES[field];
    const match = normalizedHeaders.find(
      (h) => !usedHeaders.has(h.original) && aliases.includes(h.normalized),
    );
    if (match) {
      mapping[field] = match.original;
      usedHeaders.add(match.original);
    }
  }

  // Pass 2: substring "contains" match for anything still unmatched.
  for (const { field } of MAPPABLE_FIELDS) {
    if (mapping[field]) continue;
    const aliases = FIELD_ALIASES[field];
    const match = normalizedHeaders.find(
      (h) =>
        !usedHeaders.has(h.original) &&
        aliases.some((alias) => h.normalized.includes(alias)),
    );
    if (match) {
      mapping[field] = match.original;
      usedHeaders.add(match.original);
    }
  }

  return mapping;
}

function parseSalary(value: string | undefined): number | null {
  if (!value) return null;
  const digits = value.replace(/[^0-9.]/g, "");
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function parseDate(value: string | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toISOString().slice(0, 10);
}

export interface CsvImportResult {
  rows: ApplicationInput[];
  skipped: number;
}

export function buildRowsFromMapping(
  csvRows: Record<string, string>[],
  mapping: Partial<Record<MappableField, string>>,
): CsvImportResult {
  const rows: ApplicationInput[] = [];
  let skipped = 0;

  for (const row of csvRows) {
    const get = (field: MappableField) => {
      const header = mapping[field];
      return header ? row[header]?.trim() : undefined;
    };

    const company = get("company");
    const position = get("position");
    if (!company || !position) {
      skipped += 1;
      continue;
    }

    rows.push({
      company,
      position,
      job_url: get("job_url") || null,
      location: get("location") || null,
      source: "linkedin",
      status: "wishlist",
      salary_min: parseSalary(get("salary_min")),
      salary_max: parseSalary(get("salary_max")),
      applied_date: parseDate(get("applied_date")),
      next_action: null,
      next_action_date: null,
      notes: get("notes") || null,
      contact_name: get("contact_name") || null,
      contact_info: get("contact_info") || null,
    });
  }

  return { rows, skipped };
}
