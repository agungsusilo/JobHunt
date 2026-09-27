"use client";

import { useState } from "react";
import { MapPin, Wifi, BookmarkPlus, BookmarkCheck, Loader2 } from "lucide-react";
import { bulkUpsertApplications } from "@/lib/applications";
import type { JobSearchResult } from "@/lib/jobSearch";

const SOURCE_LABEL: Record<JobSearchResult["source"], string> = {
  arbeitnow: "Arbeitnow",
  remoteok: "RemoteOK",
};

interface JobResultCardProps {
  result: JobSearchResult;
}

export function JobResultCard({ result }: JobResultCardProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const initial = result.company.trim().charAt(0).toUpperCase() || "?";

  async function handleSave() {
    setSaving(true);
    try {
      await bulkUpsertApplications([
        {
          company: result.company,
          position: result.title,
          job_url: result.url,
          location: result.location,
          source: "other",
          status: "wishlist",
          salary_min: null,
          salary_max: null,
          applied_date: null,
          next_action: null,
          next_action_date: null,
          notes: `Ditemukan via Surf the Internet (${SOURCE_LABEL[result.source]}).`,
          contact_name: null,
          contact_info: null,
        },
      ]);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card flex items-start gap-3 p-4 transition-shadow hover:shadow-md">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
        style={{ backgroundColor: "var(--series-blue-soft)", color: "var(--series-blue)" }}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--series-blue)] hover:underline"
        >
          {result.title}
        </a>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)]">
          <span className="font-medium">{result.company}</span>
          {result.location && result.location.toLowerCase() !== "remote" && (
            <span className="flex items-center gap-1 text-[var(--text-muted)]">
              <MapPin size={11} />
              {result.location}
            </span>
          )}
          {result.remote && (
            <span className="flex items-center gap-1 text-[var(--text-muted)]">
              <Wifi size={11} />
              Remote
            </span>
          )}
        </p>
        <a
          href={
            result.source === "remoteok"
              ? "https://remoteok.com"
              : "https://www.arbeitnow.com"
          }
          target="_blank"
          rel="noopener"
          className="mt-2 inline-block text-[11px] text-[var(--text-muted)] hover:underline"
        >
          Source: {SOURCE_LABEL[result.source]}
        </a>
      </div>
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className={`shrink-0 ${saved ? "btn-secondary" : "btn-primary"} disabled:opacity-70`}
      >
        {saving ? (
          <Loader2 size={14} className="animate-spin" />
        ) : saved ? (
          <BookmarkCheck size={14} />
        ) : (
          <BookmarkPlus size={14} />
        )}
        {saved ? "Tersimpan" : saving ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  );
}
