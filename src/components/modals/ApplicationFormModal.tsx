"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { STATUS_OPTIONS, SOURCE_OPTIONS } from "@/lib/constants";
import type { Application, ApplicationInput } from "@/lib/types";

interface ApplicationFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: ApplicationInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  initial?: Application | Partial<ApplicationInput> | null;
}

const EMPTY: ApplicationInput = {
  company: "",
  position: "",
  job_url: null,
  location: null,
  source: "linkedin",
  status: "wishlist",
  salary_min: null,
  salary_max: null,
  applied_date: null,
  next_action: null,
  next_action_date: null,
  notes: null,
  contact_name: null,
  contact_info: null,
};

export function ApplicationFormModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  initial,
}: ApplicationFormModalProps) {
  // `initial` only changes identity when the parent wants a fresh form (see
  // the `key` prop at each call site, which remounts this component rather
  // than relying on an effect to resync state).
  const [form, setForm] = useState<ApplicationInput>(() => ({
    ...EMPTY,
    ...initial,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(initial && "id" in (initial as Application));

  function set<K extends keyof ApplicationInput>(
    key: K,
    value: ApplicationInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.position.trim()) {
      setError("Company and position are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit application" : "Add application"}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company" required>
            <input
              className="input"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="Position" required>
            <input
              className="input"
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
            />
          </Field>
          <Field label="Job URL">
            <input
              className="input"
              value={form.job_url ?? ""}
              onChange={(e) => set("job_url", e.target.value || null)}
            />
          </Field>
          <Field label="Location">
            <input
              className="input"
              value={form.location ?? ""}
              onChange={(e) => set("location", e.target.value || null)}
            />
          </Field>
          <Field label="Status">
            <select
              className="input"
              value={form.status}
              onChange={(e) =>
                set("status", e.target.value as ApplicationInput["status"])
              }
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Source">
            <select
              className="input"
              value={form.source}
              onChange={(e) =>
                set("source", e.target.value as ApplicationInput["source"])
              }
            >
              {SOURCE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Salary min">
            <input
              type="number"
              className="input"
              value={form.salary_min ?? ""}
              onChange={(e) =>
                set(
                  "salary_min",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
            />
          </Field>
          <Field label="Salary max">
            <input
              type="number"
              className="input"
              value={form.salary_max ?? ""}
              onChange={(e) =>
                set(
                  "salary_max",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
            />
          </Field>
          <Field label="Applied date">
            <input
              type="date"
              className="input"
              value={form.applied_date ?? ""}
              onChange={(e) => set("applied_date", e.target.value || null)}
            />
          </Field>
          <Field label="Next action date">
            <input
              type="date"
              className="input"
              value={form.next_action_date ?? ""}
              onChange={(e) =>
                set("next_action_date", e.target.value || null)
              }
            />
          </Field>
          <Field label="Contact name">
            <input
              className="input"
              value={form.contact_name ?? ""}
              onChange={(e) => set("contact_name", e.target.value || null)}
            />
          </Field>
          <Field label="Contact info">
            <input
              className="input"
              value={form.contact_info ?? ""}
              onChange={(e) => set("contact_info", e.target.value || null)}
            />
          </Field>
        </div>
        <Field label="Next action">
          <input
            className="input"
            value={form.next_action ?? ""}
            onChange={(e) => set("next_action", e.target.value || null)}
          />
        </Field>
        <Field label="Notes">
          <textarea
            className="input min-h-24"
            value={form.notes ?? ""}
            onChange={(e) => set("notes", e.target.value || null)}
          />
        </Field>

        {error && <p className="text-sm text-[var(--status-critical)]">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <div>
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm("Delete this application?")) {
                    await onDelete();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-sm text-[var(--status-critical)] hover:underline"
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
        {label}
        {required && <span className="text-[var(--status-critical)]"> *</span>}
      </span>
      {children}
    </label>
  );
}
