"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  MAPPABLE_FIELDS,
  buildRowsFromMapping,
  guessColumnMapping,
  parseCsvFile,
  type MappableField,
  type ParsedCsv,
} from "@/lib/csvImport";
import { bulkUpsertApplications } from "@/lib/applications";

interface CsvImportModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

type Step = "upload" | "map" | "done";

export function CsvImportModal({
  open,
  onClose,
  onImported,
}: CsvImportModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<Partial<Record<MappableField, string>>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<{ imported: number; skipped: number } | null>(
    null,
  );

  function reset() {
    setStep("upload");
    setParsed(null);
    setMapping({});
    setError(null);
    setSummary(null);
  }

  async function handleFile(file: File) {
    try {
      const result = await parseCsvFile(file);
      if (result.rows.length === 0) {
        setError("No rows found in that CSV.");
        return;
      }
      setParsed(result);
      setMapping(guessColumnMapping(result.headers));
      setStep("map");
      setError(null);
    } catch {
      setError("Could not parse that file as CSV.");
    }
  }

  async function handleCommit() {
    if (!parsed) return;
    const { rows, skipped } = buildRowsFromMapping(parsed.rows, mapping);
    if (rows.length === 0) {
      setError("No valid rows to import (company and position are required).");
      return;
    }
    setImporting(true);
    setError(null);
    try {
      await bulkUpsertApplications(rows);
      setSummary({ imported: rows.length, skipped });
      setStep("done");
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Import from CSV"
      wide
    >
      {step === "upload" && (
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">
            Works with LinkedIn&apos;s data export (Settings &gt; Data privacy
            &gt; Get a copy of your data &mdash; Saved Jobs / Jobs Applied) or
            any CSV with company/position columns.
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="block w-full text-sm"
          />
          {error && <p className="text-sm text-[var(--status-critical)]">{error}</p>}
        </div>
      )}

      {step === "map" && parsed && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Confirm which column maps to each field. {parsed.rows.length} row
            {parsed.rows.length === 1 ? "" : "s"} found.
          </p>
          <div className="space-y-2">
            {MAPPABLE_FIELDS.map(({ field, label, required }) => (
              <div
                key={field}
                className="grid grid-cols-[1fr_2fr] items-center gap-3"
              >
                <span className="text-sm text-[var(--text-secondary)]">
                  {label}
                  {required && (
                    <span className="text-[var(--status-critical)]"> *</span>
                  )}
                </span>
                <select
                  className="input"
                  value={mapping[field] ?? ""}
                  onChange={(e) =>
                    setMapping((m) => ({
                      ...m,
                      [field]: e.target.value || undefined,
                    }))
                  }
                >
                  <option value="">&mdash; don&apos;t import &mdash;</option>
                  {parsed.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-[var(--status-critical)]">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setStep("upload")}
              className="rounded-md border border-[var(--border-hairline)] px-4 py-2 text-sm"
            >
              Back
            </button>
            <button
              onClick={handleCommit}
              disabled={importing}
              className="rounded-md bg-[var(--series-blue)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {importing ? "Importing..." : "Import"}
            </button>
          </div>
        </div>
      )}

      {step === "done" && summary && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-primary)]">
            Imported {summary.imported} row
            {summary.imported === 1 ? "" : "s"}.
            {summary.skipped > 0 &&
              ` Skipped ${summary.skipped} row${summary.skipped === 1 ? "" : "s"} missing company/position.`}
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => {
                reset();
                onClose();
              }}
              className="rounded-md bg-[var(--series-blue)] px-4 py-2 text-sm font-medium text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
