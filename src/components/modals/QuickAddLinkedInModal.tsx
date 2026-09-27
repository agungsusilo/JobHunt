"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ApplicationFormModal } from "@/components/modals/ApplicationFormModal";
import { parseLinkedInPaste } from "@/lib/linkedinParse";
import { createApplication } from "@/lib/applications";
import type { ApplicationInput } from "@/lib/types";

interface QuickAddLinkedInModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function QuickAddLinkedInModal({
  open,
  onClose,
  onSaved,
}: QuickAddLinkedInModalProps) {
  const [raw, setRaw] = useState("");
  const [draft, setDraft] = useState<Partial<ApplicationInput> | null>(null);

  function handleParse() {
    setDraft(parseLinkedInPaste(raw));
  }

  function handleClose() {
    setRaw("");
    setDraft(null);
    onClose();
  }

  if (draft) {
    return (
      <ApplicationFormModal
        open={open}
        onClose={handleClose}
        initial={draft}
        onSubmit={async (input) => {
          await createApplication(input);
          onSaved();
        }}
      />
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Quick add from LinkedIn" wide>
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">
          Copy the text from a LinkedIn job posting page (title, company, and
          description) and paste it below. We&apos;ll try to pre-fill the
          fields &mdash; you can always fix them on the next step.
        </p>
        <textarea
          className="input min-h-48"
          placeholder="Paste job posting text here..."
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleParse}
            disabled={!raw.trim()}
            className="btn-primary disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
}
