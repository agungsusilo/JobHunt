"use client";

import { useState } from "react";
import { Loader2, Link2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ApplicationFormModal } from "@/components/modals/ApplicationFormModal";
import { bulkUpsertApplications } from "@/lib/applications";
import type { ApplicationInput } from "@/lib/types";

interface PasteLinkModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface LinkMetaResponse {
  title: string | null;
  siteName: string | null;
  guessedCompany: string | null;
  guessedPosition: string | null;
}

export function PasteLinkModal({ open, onClose, onSaved }: PasteLinkModalProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<ApplicationInput> | null>(null);

  function handleClose() {
    setUrl("");
    setDraft(null);
    setError(null);
    onClose();
  }

  async function handleContinue() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/fetch-link-meta?url=${encodeURIComponent(trimmed)}`,
      );
      const meta: LinkMetaResponse = await res.json();
      const hostname = new URL(trimmed).hostname;

      setDraft({
        job_url: trimmed,
        company: meta.guessedCompany ?? "",
        position: meta.guessedPosition ?? "",
        source: hostname.includes("linkedin.com") ? "linkedin" : "other",
        status: "wishlist",
        notes: meta.title
          ? null
          : "Tidak bisa mengambil detail otomatis dari link ini — lengkapi manual.",
      });
    } catch {
      // Fetch/validation failed entirely — still let the user proceed manually.
      setDraft({
        job_url: trimmed,
        source: "other",
        status: "wishlist",
      });
    } finally {
      setLoading(false);
    }
  }

  if (draft) {
    return (
      <ApplicationFormModal
        open={open}
        onClose={handleClose}
        initial={draft}
        onSubmit={async (input) => {
          await bulkUpsertApplications([input]);
          onSaved();
        }}
      />
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Paste job link">
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">
          Tempel link lowongan (job board, career page perusahaan, dll).
          Kami coba ambil judul & nama perusahaan otomatis dari halamannya —
          untuk LinkedIn biasanya perlu dilengkapi manual karena mereka
          membatasi akses tanpa login.
        </p>
        <div className="relative">
          <Link2
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            className="input pl-9"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
        </div>
        {error && <p className="text-sm text-[var(--status-critical)]">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!url.trim() || loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Mengambil detail..." : "Continue"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
