import { KanbanSquare, Table2 } from "lucide-react";

export type ViewMode = "kanban" | "table";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const MODES: { mode: ViewMode; label: string; icon: typeof KanbanSquare }[] = [
  { mode: "kanban", label: "Kanban", icon: KanbanSquare },
  { mode: "table", label: "Table", icon: Table2 },
];

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex gap-0.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-1)] p-1">
      {MODES.map(({ mode, label, icon: Icon }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === mode
              ? "bg-[var(--series-blue)] text-white"
              : "text-[var(--text-secondary)] hover:bg-black/5"
          }`}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  );
}
