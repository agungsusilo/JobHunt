"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useApplications } from "@/hooks/useApplications";
import {
  createApplication,
  deleteApplication,
  updateApplication,
  updateApplicationStatus,
} from "@/lib/applications";
import { ViewToggle, type ViewMode } from "@/components/dashboard/ViewToggle";
import { ApplicationsTable } from "@/components/table/ApplicationsTable";
import { ApplicationFormModal } from "@/components/modals/ApplicationFormModal";
import { CsvImportModal } from "@/components/modals/CsvImportModal";
import { QuickAddLinkedInModal } from "@/components/modals/QuickAddLinkedInModal";
import { PasteLinkModal } from "@/components/modals/PasteLinkModal";
import type { Application, ApplicationInput, ApplicationStatus } from "@/lib/types";

const KanbanBoard = dynamic(
  () => import("@/components/kanban/KanbanBoard").then((m) => m.KanbanBoard),
  { ssr: false },
);

export function BoardClient() {
  const { applications, loading, error } = useApplications();
  const [view, setView] = useState<ViewMode>("kanban");
  const [editing, setEditing] = useState<Application | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [csvOpen, setCsvOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [pasteLinkOpen, setPasteLinkOpen] = useState(false);

  function openNew() {
    setEditing(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEdit(app: Application) {
    setEditing(app);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  async function handleSubmit(input: ApplicationInput) {
    if (editing) {
      await updateApplication(editing.id, input);
    } else {
      await createApplication(input);
    }
  }

  async function handleStatusChange(id: string, status: ApplicationStatus) {
    await updateApplicationStatus(id, status);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Job Board
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPasteLinkOpen(true)}
            className="rounded-md border border-[var(--border-hairline)] px-3 py-2 text-sm"
          >
            Paste job link
          </button>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="rounded-md border border-[var(--border-hairline)] px-3 py-2 text-sm"
          >
            Quick add from LinkedIn
          </button>
          <button
            onClick={() => setCsvOpen(true)}
            className="rounded-md border border-[var(--border-hairline)] px-3 py-2 text-sm"
          >
            Import CSV
          </button>
          <button
            onClick={openNew}
            className="rounded-md bg-[var(--series-blue)] px-3 py-2 text-sm font-medium text-white"
          >
            Add application
          </button>
        </div>
      </header>

      <div className="mb-4">
        <ViewToggle value={view} onChange={setView} />
      </div>

      {loading && <p className="text-sm text-[var(--text-muted)]">Loading…</p>}
      {error && <p className="text-sm text-[var(--status-critical)]">{error}</p>}

      {!loading && !error && view === "kanban" && (
        <KanbanBoard
          applications={applications}
          onCardClick={openEdit}
          onStatusChange={handleStatusChange}
        />
      )}

      {!loading && !error && view === "table" && (
        <ApplicationsTable
          applications={applications}
          onRowClick={openEdit}
          onStatusChange={handleStatusChange}
        />
      )}

      <ApplicationFormModal
        key={formKey}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSubmit={handleSubmit}
        onDelete={editing ? () => deleteApplication(editing.id) : undefined}
      />

      <CsvImportModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onImported={() => {}}
      />

      <QuickAddLinkedInModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSaved={() => setQuickAddOpen(false)}
      />

      <PasteLinkModal
        open={pasteLinkOpen}
        onClose={() => setPasteLinkOpen(false)}
        onSaved={() => setPasteLinkOpen(false)}
      />
    </div>
  );
}
