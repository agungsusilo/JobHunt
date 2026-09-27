"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Globe, KanbanSquare, Briefcase, User } from "lucide-react";

const LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/surf", label: "Surf the Internet", icon: Globe },
  { href: "/board", label: "Job Board", icon: KanbanSquare },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-[var(--border-hairline)] bg-[var(--surface-1)] px-3 py-5">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
          style={{ background: "var(--series-blue)" }}
        >
          <Briefcase size={16} />
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          JobHunt
        </span>
      </div>
      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--series-blue-soft)] text-[var(--series-blue)]"
                  : "text-[var(--text-secondary)] hover:bg-black/5"
              }`}
            >
              {active && (
                <span
                  className="absolute -left-3 h-5 w-1 rounded-r-full"
                  style={{ background: "var(--series-blue)" }}
                />
              )}
              <Icon size={17} strokeWidth={2} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
