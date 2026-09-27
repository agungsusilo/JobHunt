"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./KanbanColumn";
import { STATUS_OPTIONS } from "@/lib/constants";
import type { Application, ApplicationStatus } from "@/lib/types";

interface KanbanBoardProps {
  applications: Application[];
  onCardClick: (app: Application) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}

export function KanbanBoard({
  applications,
  onCardClick,
  onStatusChange,
}: KanbanBoardProps) {
  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    onStatusChange(draggableId, destination.droppableId as ApplicationStatus);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUS_OPTIONS.map((meta) => (
          <KanbanColumn
            key={meta.value}
            meta={meta}
            applications={applications.filter((a) => a.status === meta.value)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
