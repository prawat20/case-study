"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommandPalette } from "@/components/CommandProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavItem = {
  label: string;
  href: string;
  match: (pathname: string) => boolean;
};

const NAV: NavItem[] = [
  {
    label: "Now",
    href: "/",
    match: (p) => p === "/" || p === "",
  },
  {
    label: "Calendar",
    href: "/quarter/",
    match: (p) => p.startsWith("/quarter"),
  },
  {
    label: "Audit",
    href: "/audit/",
    match: (p) => p.startsWith("/audit"),
  },
];

export function Header() {
  const { open } = useCommandPalette();
  const pathname = usePathname() || "/";

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-elevated)]/85 px-6 backdrop-blur-md"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {/* Wordmark */}
      <Link href="/" className="flex items-center gap-2 group">
        <span
          aria-hidden
          className="flex h-6 w-6 items-center justify-center rounded-[5px] transition-transform group-hover:scale-105"
          style={{
            background: "var(--color-accent)",
            color: "var(--color-elevated)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          ◆
        </span>
        <span
          className="text-[15px] font-semibold tracking-tight"
          style={{ color: "var(--color-primary)" }}
        >
          Glide
        </span>
      </Link>

      {/* Nav */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3 py-1.5 text-[13px] font-medium transition-colors ${
                active
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-tertiary)] hover:text-[var(--color-primary)]"
              }`}
            >
              {item.label}
              {active && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2"
                  style={{
                    height: 2,
                    width: 16,
                    background: "var(--color-accent)",
                    borderRadius: 999,
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={open}
          aria-label="Open command palette"
          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2 font-mono text-[10px] text-tertiary transition hover:bg-card-hover hover:text-primary"
          style={{ background: "var(--color-page)" }}
        >
          <span>⌘K</span>
        </button>
      </div>
    </header>
  );
}
