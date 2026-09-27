#!/usr/bin/env node
// Bulk-import job listings into Supabase from a JSON file.
//
// Usage: node --env-file=.env.local scripts/import-jobs.mjs path/to/jobs.json
//
// JSON shape (either works):
//   { "default_source": "linkedin", "jobs": [ { "company": "...", "position": "...", ... } ] }
//   [ { "company": "...", "position": "...", ... } ]
//
// Only "company" and "position" are required per job. Rows are upserted on
// job_url, so re-running with overlapping data updates existing rows instead
// of duplicating them.

import { readFileSync } from "node:fs";
import { createAdminClient } from "./lib/supabaseAdmin.mjs";

const VALID_STATUSES = [
  "wishlist",
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];
const VALID_SOURCES = ["linkedin", "company_site", "referral", "other"];
const CHUNK_SIZE = 200;

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function normalizeInput(path) {
  let raw;
  try {
    raw = readFileSync(path, "utf-8");
  } catch (err) {
    fail(`could not read file "${path}": ${err.message}`);
  }

  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    fail(`invalid JSON in "${path}": ${err.message}`);
  }

  if (Array.isArray(json)) {
    return { defaultSource: "linkedin", jobs: json };
  }
  if (json && Array.isArray(json.jobs)) {
    return { defaultSource: json.default_source ?? "linkedin", jobs: json.jobs };
  }
  fail(
    'expected a JSON array of jobs, or an object shaped { "jobs": [...] }',
  );
  return { defaultSource: "linkedin", jobs: [] };
}

function buildRow(job, defaultSource, index, skipped) {
  const company = typeof job.company === "string" ? job.company.trim() : "";
  const position = typeof job.position === "string" ? job.position.trim() : "";
  if (!company || !position) {
    skipped.push({ index, reason: "missing company or position" });
    return null;
  }

  let status = job.status ?? "wishlist";
  if (!VALID_STATUSES.includes(status)) {
    console.warn(
      `Warning: row ${index} has invalid status "${status}", defaulting to "wishlist".`,
    );
    status = "wishlist";
  }

  let source = job.source ?? defaultSource;
  if (!VALID_SOURCES.includes(source)) {
    console.warn(
      `Warning: row ${index} has invalid source "${source}", defaulting to "${defaultSource}".`,
    );
    source = defaultSource;
  }

  return {
    company,
    position,
    job_url: job.job_url ? String(job.job_url).trim() : null,
    location: job.location ?? null,
    source,
    status,
    salary_min: job.salary_min ?? null,
    salary_max: job.salary_max ?? null,
    applied_date: job.applied_date ?? null,
    next_action: job.next_action ?? null,
    next_action_date: job.next_action_date ?? null,
    notes: job.notes ?? null,
    contact_name: job.contact_name ?? null,
    contact_info: job.contact_info ?? null,
  };
}

async function main() {
  const path = process.argv[2];
  if (!path) {
    fail("usage: node --env-file=.env.local scripts/import-jobs.mjs <file.json>");
  }

  const { defaultSource, jobs } = normalizeInput(path);
  const skipped = [];
  const rows = jobs
    .map((job, i) => buildRow(job, defaultSource, i, skipped))
    .filter(Boolean);

  if (rows.length === 0) {
    fail("no valid rows to import (every row was missing company/position).");
  }

  const client = createAdminClient();
  let upserted = 0;

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const { data, error } = await client
      .from("applications")
      .upsert(chunk, { onConflict: "job_url" })
      .select("id");
    if (error) {
      fail(`Supabase upsert failed: ${error.message}`);
    }
    upserted += data.length;
  }

  console.log(`Imported/updated ${upserted} row(s).`);
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} row(s):`);
    for (const s of skipped) {
      console.log(`  - row ${s.index}: ${s.reason}`);
    }
  }
}

main();
