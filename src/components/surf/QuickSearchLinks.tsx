import { Users, Briefcase, Building2, Search, ExternalLink } from "lucide-react";
import { buildQuickSearchLinks, type QuickSearchParams } from "@/lib/quickSearchLinks";

const ICONS: Record<string, typeof Users> = {
  LinkedIn: Users,
  Indeed: Briefcase,
  Glassdoor: Building2,
  "Google Jobs": Search,
};

export function QuickSearchLinks(params: QuickSearchParams) {
  const links = buildQuickSearchLinks(params);

  return (
    <div className="mb-6">
      <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
        Cari langsung di situs lowongan
      </h2>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => {
          const Icon = ICONS[link.label] ?? Search;
          return (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <Icon size={15} />
              {link.label}
              <ExternalLink size={12} className="text-[var(--text-muted)]" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
