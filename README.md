# JobHunt

Personal job-application tracker. Single-user, no login — a Kanban + table
view backed by Supabase, with a few ways to get jobs (including LinkedIn
listings) into it without a live LinkedIn API integration (LinkedIn doesn't
offer one for personal saved/applied jobs).

## Setup

1. **Supabase schema**: open your Supabase project's SQL Editor and run
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   It's idempotent, so re-running it is safe.
2. **Environment**: copy `.env.local.example` to `.env.local` and fill in
   your project's URL, anon key, and service role key (Project Settings →
   API in the Supabase dashboard).
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:3000.

## Using the dashboard

- **Kanban / Table toggle** at the top switches views. Drag a card between
  columns, or use the status dropdown in the table, to move an application
  through the pipeline (wishlist → applied → phone screen → interview →
  offer/rejected/withdrawn).
- **Add application** opens a blank form. Click any card/row to edit or
  delete it.
- **Import CSV** accepts LinkedIn's official data export (Settings & Privacy
  → Data privacy → Get a copy of your data → Saved Jobs / Jobs Applied) or
  any CSV with company/position columns. Column names are fuzzy-matched;
  you'll always get a chance to confirm/fix the mapping before importing.
- **Quick add from LinkedIn** — paste the copied text of a job posting page
  and it'll try to pre-fill company/position/location/URL. Always review the
  pre-filled form before saving since the extraction is best-effort.

## Bulk import via script

`scripts/import-jobs.mjs` bulk-upserts jobs from a JSON file directly into
Supabase (using the service role key, so it bypasses RLS — never run this
against an untrusted file). This is the intended hook for a *separate* Claude
session that has browser access (e.g. Claude Desktop with Claude in Chrome or
the built-in browser) to read your LinkedIn saved/applied jobs pages and feed
them in here, since this build environment has no browser tool available.

```bash
npm run import:jobs -- path/to/jobs.json
```

JSON shape (either form works):

```json
{ "default_source": "linkedin", "jobs": [ { "company": "...", "position": "..." } ] }
```
or a bare array `[ { "company": "...", "position": "..." } ]`.

Only `company` and `position` are required; every other field mirrors the
`applications` table's columns (snake_case). Rows are upserted on `job_url`,
so re-running the script with overlapping data updates existing rows instead
of duplicating them. Try it with the included fixture:

```bash
npm run import:jobs -- scripts/sample-jobs.json
```

## Security note

Row Level Security is enabled with a permissive `USING (true)` policy for
`anon`/`authenticated` — correct for this single-user local tool, but **do
not deploy this publicly** without adding real authentication first, since
anyone with the anon key could read/write all rows.
