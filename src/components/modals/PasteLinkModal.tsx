"use client";

import { useState } from "react";
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
        <input
          className="input"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoFocus
        />
        {error && <p className="text-sm text-[var(--status-critical)]">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="rounded-md border border-[var(--border-hairline)] px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!url.trim() || loading}
            className="rounded-md bg-[var(--series-blue)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Mengambil detail..." : "Continue"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
