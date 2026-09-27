"use client";

import { useEffect, useState } from "react";
import {
  FileUp,
  FileText,
  Trash2,
  Loader2,
  ExternalLink,
  Save,
  CheckCircle2,
} from "lucide-react";
import {
  getProfile,
  saveProfile,
  uploadCv,
  deleteCvFile,
  getCvUrl,
  CV_MAX_SIZE_BYTES,
  CV_ACCEPTED_TYPES,
} from "@/lib/profile";
import { LoadingState } from "@/components/ui/LoadingState";
import type { Profile, ProfileInput } from "@/lib/types";

const EMPTY: ProfileInput = {
  full_name: "",
  email: "",
  phone: "",
  location: "",
  headline: "",
  linkedin_url: "",
  portfolio_url: "",
  summary: "",
};

export function ProfileClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<ProfileInput>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then((data) => {
        if (data) {
          setProfile(data);
          setForm(data);
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await saveProfile(profile?.id ?? null, form);
      setProfile(updated);
      setForm(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCvUpload(file: File) {
    if (!CV_ACCEPTED_TYPES.includes(file.type)) {
      setCvError("Format tidak didukung. Gunakan PDF, DOC, atau DOCX.");
      return;
    }
    if (file.size > CV_MAX_SIZE_BYTES) {
      setCvError("Ukuran file maksimal 10MB.");
      return;
    }
    setCvUploading(true);
    setCvError(null);
    try {
      const { path } = await uploadCv(file);
      const oldPath = profile?.cv_path;
      const updated = await saveProfile(profile?.id ?? null, {
        cv_path: path,
        cv_filename: file.name,
        cv_uploaded_at: new Date().toISOString(),
      });
      setProfile(updated);
      setForm(updated);
      if (oldPath) {
        await deleteCvFile(oldPath).catch(() => {});
      }
    } catch (err) {
      setCvError(err instanceof Error ? err.message : "Gagal mengunggah CV.");
    } finally {
      setCvUploading(false);
    }
  }

  async function handleCvRemove() {
    if (!profile?.cv_path) return;
    if (!confirm("Hapus CV yang sudah diunggah?")) return;
    setCvUploading(true);
    setCvError(null);
    try {
      await deleteCvFile(profile.cv_path);
      const updated = await saveProfile(profile.id, {
        cv_path: null,
        cv_filename: null,
        cv_uploaded_at: null,
      });
      setProfile(updated);
      setForm(updated);
    } catch (err) {
      setCvError(err instanceof Error ? err.message : "Gagal menghapus CV.");
    } finally {
      setCvUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Profile
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Info kontak dan CV kamu, tersimpan di satu tempat.
        </p>
      </header>

      <div className="card mb-6 p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <FileText size={16} className="text-[var(--text-muted)]" />
          CV / Resume
        </h2>

        {profile?.cv_path ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--series-blue-soft)" }}
              >
                <FileText size={18} color="var(--series-blue)" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {profile.cv_filename}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Diunggah{" "}
                  {profile.cv_uploaded_at
                    ? new Date(profile.cv_uploaded_at).toLocaleDateString("id-ID")
                    : "—"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <a
                href={getCvUrl(profile.cv_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <ExternalLink size={14} />
                Lihat
              </a>
              <label className="btn-secondary cursor-pointer">
                {cvUploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileUp size={14} />
                )}
                Ganti
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  disabled={cvUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCvUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <button
                onClick={handleCvRemove}
                disabled={cvUploading}
                className="btn-secondary text-[var(--status-critical)] disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[var(--border-hairline)] px-4 py-8 text-center transition-colors hover:border-[var(--series-blue)] hover:bg-[var(--series-blue-soft)]">
            {cvUploading ? (
              <Loader2 size={22} className="animate-spin text-[var(--text-muted)]" />
            ) : (
              <FileUp size={22} className="text-[var(--text-muted)]" />
            )}
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {cvUploading ? "Mengunggah..." : "Klik untuk unggah CV"}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              PDF, DOC, atau DOCX &middot; maks 10MB
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              disabled={cvUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCvUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        )}
        {cvError && (
          <p className="mt-2 text-sm text-[var(--status-critical)]">{cvError}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Informasi pribadi
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nama lengkap">
            <input
              className="input"
              value={form.full_name ?? ""}
              onChange={(e) => set("full_name", e.target.value)}
            />
          </Field>
          <Field label="Headline / posisi target">
            <input
              className="input"
              placeholder="e.g. Senior Frontend Engineer"
              value={form.headline ?? ""}
              onChange={(e) => set("headline", e.target.value)}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="input"
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Telepon">
            <input
              className="input"
              value={form.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Lokasi">
            <input
              className="input"
              placeholder="e.g. Jakarta, Indonesia"
              value={form.location ?? ""}
              onChange={(e) => set("location", e.target.value)}
            />
          </Field>
          <Field label="LinkedIn URL">
            <input
              className="input"
              placeholder="https://linkedin.com/in/..."
              value={form.linkedin_url ?? ""}
              onChange={(e) => set("linkedin_url", e.target.value)}
            />
          </Field>
          <Field label="Portfolio / website">
            <input
              className="input"
              placeholder="https://..."
              value={form.portfolio_url ?? ""}
              onChange={(e) => set("portfolio_url", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Ringkasan singkat">
          <textarea
            className="input min-h-24"
            placeholder="Ringkasan pengalaman/keahlian singkat..."
            value={form.summary ?? ""}
            onChange={(e) => set("summary", e.target.value)}
          />
        </Field>

        {error && <p className="text-sm text-[var(--status-critical)]">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-[var(--status-good)]">
              <CheckCircle2 size={15} />
              Tersimpan
            </span>
          )}
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
        {label}
      </span>
      {children}
    </label>
  );
}
