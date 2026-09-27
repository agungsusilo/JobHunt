"use client";

import { Droppable } from "@hello-pangea/dnd";
import { KanbanCard } from "./KanbanCard";
import type { StatusMeta } from "@/lib/constants";
import type { Application } from "@/lib/types";

interface KanbanColumnProps {
  meta: StatusMeta;
  applications: Application[];
  onCardClick: (app: Application) => void;
}

export function KanbanColumn({
  meta,
  applications,
  onCardClick,
}: KanbanColumnProps) {
  return (
    <div className="flex w-64 shrink-0 flex-col rounded-xl bg-[var(--page-plane)] p-1">
      <div className="flex items-center gap-2 px-2 py-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: `var(${meta.colorVar})` }}
        />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {meta.label}
        </h3>
        <span className="ml-auto rounded-full bg-black/5 px-1.5 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">
          {applications.length}
        </span>
      </div>
      <Droppable droppableId={meta.value}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[120px] flex-1 rounded-lg px-1.5 py-1 transition-colors ${
              snapshot.isDraggingOver ? "bg-[var(--series-blue-soft)]" : ""
            }`}
          >
            {applications.map((app, index) => (
              <KanbanCard
                key={app.id}
                application={app}
                index={index}
                onClick={() => onCardClick(app)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
