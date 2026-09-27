import { buildQuickSearchLinks, type QuickSearchParams } from "@/lib/quickSearchLinks";

export function QuickSearchLinks(params: QuickSearchParams) {
  const links = buildQuickSearchLinks(params);

  return (
    <div className="mb-6">
      <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
        Cari langsung di situs lowongan
      </h2>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-[var(--border-hairline)] bg-[var(--surface-1)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-black/5"
          >
            Cari di {link.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}
