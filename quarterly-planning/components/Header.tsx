"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCommandPalette } from "@/components/CommandProvider";

export function Header() {
  const { open } = useCommandPalette();
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    const d = new Date();
    const opts: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    const week = getISOWeek(d);
    const start = new Date(d);
    start.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    setToday(
      `Week ${week} · ${start.toLocaleDateString("en-US", opts)} — ${end.toLocaleDateString(
        "en-US",
        opts,
      )}`,
    );
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border)] px-8 py-4">
      <Link href="/" className="flex items-center gap-3">
        <span className="text-lg" style={{ color: "var(--color-accent)" }}>
          ◐
        </span>
        <span className="text-sm text-secondary">Workspace</span>
      </Link>
      <div className="flex items-center gap-5 text-xs text-tertiary">
        <span className="hidden sm:inline">{today}</span>
        <Link
          href="/quarter/"
          className="transition hover:text-primary"
        >
          Quarter
        </Link>
        <Link
          href="/architecture/"
          className="transition hover:text-primary"
        >
          System
        </Link>
        <button
          onClick={open}
          className="inline-flex items-center gap-1.5 rounded border border-[var(--color-border-strong)] bg-elevated px-2 py-1 text-[10px] font-mono text-secondary transition hover:text-primary"
        >
          <span>⌘K</span>
        </button>
        <div className="h-7 w-7 rounded-full bg-elevated" />
      </div>
    </header>
  );
}

function getISOWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
}
