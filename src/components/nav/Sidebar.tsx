"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/surf", label: "Surf the Internet" },
  { href: "/board", label: "Job Board" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--border-hairline)] bg-[var(--surface-1)] px-3 py-4">
      <span className="mb-6 px-2 text-sm font-semibold text-[var(--text-primary)]">
        JobHunt
      </span>
      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--series-blue)] text-white"
                  : "text-[var(--text-secondary)] hover:bg-black/5"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
