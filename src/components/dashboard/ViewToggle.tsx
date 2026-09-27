export type ViewMode = "kanban" | "table";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-md border border-[var(--border-hairline)] p-0.5">
      {(["kanban", "table"] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`rounded px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
            value === mode
              ? "bg-[var(--series-blue)] text-white"
              : "text-[var(--text-secondary)]"
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
