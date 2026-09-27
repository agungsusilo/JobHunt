"use client";

import { useState } from "react";
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
    <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-sm font-semibold text-[var(--series-blue)] hover:underline"
          >
            {result.title}
          </a>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            {result.company}
            {result.location && ` · ${result.location}`}
            {result.remote && " · Remote"}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="shrink-0 rounded-md border border-[var(--border-hairline)] px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          {saved ? "Tersimpan" : saving ? "Menyimpan..." : "+ Simpan ke Job Board"}
        </button>
      </div>
      <a
        href={
          result.source === "remoteok"
            ? "https://remoteok.com"
            : "https://www.arbeitnow.com"
        }
        target="_blank"
        rel="noopener"
        className="mt-2 inline-block text-xs text-[var(--text-muted)] hover:underline"
      >
        Source: {SOURCE_LABEL[result.source]}
      </a>
    </div>
  );
}
