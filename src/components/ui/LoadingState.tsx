import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-[var(--text-muted)]">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}
