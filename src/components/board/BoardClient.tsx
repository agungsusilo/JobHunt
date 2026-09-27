"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Link2, Users, Upload, Plus } from "lucide-react";
import { useApplications } from "@/hooks/useApplications";
import { LoadingState } from "@/components/ui/LoadingState";
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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Job Board
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Lacak setiap lamaran dari saved sampai offer.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setPasteLinkOpen(true)} className="btn-secondary">
            <Link2 size={15} />
            Paste job link
          </button>
          <button onClick={() => setQuickAddOpen(true)} className="btn-secondary">
            <Users size={15} />
            Quick add
          </button>
          <button onClick={() => setCsvOpen(true)} className="btn-secondary">
            <Upload size={15} />
            Import CSV
          </button>
          <button onClick={openNew} className="btn-primary">
            <Plus size={15} />
            Add application
          </button>
        </div>
      </header>

      <div className="mb-4">
        <ViewToggle value={view} onChange={setView} />
      </div>

      {loading && <LoadingState />}
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
