"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { Application } from "@/lib/types";

interface KanbanCardProps {
  application: Application;
  index: number;
  onClick: () => void;
}

export function KanbanCard({ application, index, onClick }: KanbanCardProps) {
  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`mb-2 cursor-pointer rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-1)] p-3 shadow-sm transition-shadow hover:shadow-md ${
            snapshot.isDragging ? "shadow-lg" : ""
          }`}
        >
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {application.position}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {application.company}
          </p>
          {application.location && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {application.location}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
}
