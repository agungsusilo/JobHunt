"use client";

import { Draggable } from "@hello-pangea/dnd";
import { MapPin } from "lucide-react";
import { STATUS_OPTIONS } from "@/lib/constants";
import type { Application } from "@/lib/types";

interface KanbanCardProps {
  application: Application;
  index: number;
  onClick: () => void;
}

export function KanbanCard({ application, index, onClick }: KanbanCardProps) {
  const statusMeta = STATUS_OPTIONS.find((s) => s.value === application.status);
  const initial = application.company.trim().charAt(0).toUpperCase() || "?";

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`group relative mb-2 flex cursor-pointer gap-2.5 overflow-hidden rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-1)] p-3 pl-4 shadow-sm transition-shadow hover:shadow-md ${
            snapshot.isDragging ? "shadow-lg" : ""
          }`}
        >
          <span
            className="absolute left-0 top-0 h-full w-1"
            style={{ backgroundColor: `var(${statusMeta?.colorVar ?? "--series-blue"})` }}
          />
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            style={{
              backgroundColor: "var(--series-blue-soft)",
              color: "var(--series-blue)",
            }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {application.position}
            </p>
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {application.company}
            </p>
            {application.location && (
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-[var(--text-muted)]">
                <MapPin size={11} />
                {application.location}
              </p>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
