"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { RotateCcw, HelpCircle } from "lucide-react";
import { useCommandPalette } from "@/components/CommandProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsMac } from "@/lib/platform";
import { clearDecisions, clearFrameworkOverrides } from "@/lib/decisions";
import { clearTriage } from "@/lib/triage";
import { clearCaptures } from "@/lib/captures";
import { clearCalendarState } from "@/lib/calendar-state";
import { openOnboarding } from "@/components/OnboardingModal";

type NavItem = {
  label: string;
  href: string;
  match: (pathname: string) => boolean;
};

const NAV: NavItem[] = [
  {
    label: "Now",
    href: "/",
    match: (p) =>
      p === "/" ||
      p === "" ||
      p.startsWith("/inbox") ||
      p.startsWith("/initiative"),
  },
  {
    label: "Calendar",
    href: "/calendar/",
    match: (p) => p.startsWith("/calendar") || p.startsWith("/quarter"),
  },
  {
    label: "Stakeholders",
    href: "/stakeholders/",
    match: (p) => p.startsWith("/stakeholders"),
  },
  {
    label: "Audit",
    href: "/audit/",
    match: (p) => p.startsWith("/audit"),
  },
  {
    label: "Architecture",
    href: "/architecture/",
    match: (p) => p.startsWith("/architecture"),
  },
];

export function Header() {
  const { open } = useCommandPalette();
  const pathname = usePathname() || "/";
  const isMac = useIsMac();
  const router = useRouter();
  const [confirmReset, setConfirmReset] = useState(false);

  function resetDemo() {
    clearDecisions();
    clearFrameworkOverrides();
    clearTriage();
    clearCaptures();
    clearCalendarState();
    setConfirmReset(false);
    router.push("/");
  }

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-elevated)]/85 backdrop-blur-md"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="relative flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
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
            Sift
          </span>
        </Link>

        {/* Nav — desktop (centered, absolute) */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1">
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
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={openOnboarding}
            aria-label="How Sift works"
            title="How Sift works"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-tertiary)] transition hover:bg-[var(--color-card-hover)] hover:text-[var(--color-primary)]"
          >
            <HelpCircle size={14} />
          </button>
          <ThemeToggle />
          {confirmReset ? (
            <div className="inline-flex items-center gap-1">
              <button
                onClick={resetDemo}
                aria-label="Confirm reset"
                className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium transition"
                style={{
                  background: "var(--color-warning)",
                  color: "var(--color-elevated)",
                }}
              >
                Reset demo
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                aria-label="Cancel reset"
                className="inline-flex h-7 items-center rounded-md border border-[var(--color-border)] px-2 text-[11px] transition hover:bg-[var(--color-card-hover)]"
                style={{ color: "var(--color-tertiary)" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              aria-label="Reset demo state"
              title="Reset demo state (theme preference preserved)"
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] text-[var(--color-tertiary)] transition hover:bg-[var(--color-card-hover)] hover:text-[var(--color-primary)]"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
          <button
            onClick={open}
            aria-label="Open command palette"
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2 font-mono text-[10px] text-tertiary transition hover:bg-card-hover hover:text-primary"
            style={{ background: "var(--color-page)" }}
          >
            <span suppressHydrationWarning>{isMac ? "⌘K" : "Ctrl+K"}</span>
          </button>
        </div>
      </div>

      {/* Nav — mobile/tablet (second row, scrollable if needed) */}
      <nav
        className="md:hidden flex items-center gap-0.5 overflow-x-auto px-2 pb-1.5 -mt-0.5"
        style={{ scrollbarWidth: "none" }}
      >
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3 py-1.5 text-[13px] font-medium transition-colors shrink-0 ${
                active
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-tertiary)]"
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
    </header>
  );
}
