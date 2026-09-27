import type { ApplicationInput } from "./types";

const SECTION_HEADERS = [
  "about the job",
  "about the role",
  "job description",
  "qualifications",
  "requirements",
  "responsibilities",
];

const LOCATION_KEYWORDS = ["remote", "hybrid", "on-site", "onsite"];

function extractUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s)]+/);
  if (!match) return null;
  try {
    const url = new URL(match[0]);
    url.search = ""; // strip tracking params (refId, trackingId, etc.)
    return url.toString();
  } catch {
    return match[0];
  }
}

function splitTitleCompanyLocation(lines: string[]): {
  position: string | null;
  company: string | null;
  location: string | null;
} {
  for (let i = 0; i < lines.length - 1; i++) {
    const separator = lines[i + 1].match(/\s*(·|-|\|)\s*/);
    if (separator) {
      const parts = lines[i + 1]
        .split(separator[0])
        .map((p) => p.trim())
        .filter(Boolean);
      return {
        position: lines[i],
        company: parts[0] ?? null,
        location: parts[1] ?? null,
      };
    }
  }
  // Fallback: first line = position, second line = company.
  return {
    position: lines[0] ?? null,
    company: lines[1] ?? null,
    location: null,
  };
}

export function parseLinkedInPaste(raw: string): Partial<ApplicationInput> {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { source: "linkedin", status: "wishlist" };
  }

  const jobUrl = extractUrl(raw);
  const { position, company, location } = splitTitleCompanyLocation(lines);

  let resolvedLocation = location;
  if (!resolvedLocation) {
    const locationLine = lines.find((line) =>
      LOCATION_KEYWORDS.some((kw) => line.toLowerCase().includes(kw)),
    );
    resolvedLocation = locationLine ?? null;
  }

  const lowerRaw = raw.toLowerCase();
  let notesStart = -1;
  for (const header of SECTION_HEADERS) {
    const idx = lowerRaw.indexOf(header);
    if (idx !== -1 && (notesStart === -1 || idx < notesStart)) {
      notesStart = idx;
    }
  }
  const notes = notesStart !== -1 ? raw.slice(notesStart).trim() : raw.trim();

  return {
    position: position ?? undefined,
    company: company ?? undefined,
    location: resolvedLocation,
    job_url: jobUrl,
    source: "linkedin",
    status: "wishlist",
    notes,
  };
}
