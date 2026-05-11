"use client";

import { useIsMac } from "@/lib/platform";

type Props = {
  /** Render the mod prefix (⌘ on Mac, Ctrl+ on Windows). Default true. */
  mod?: boolean;
  /** The key label after the mod — e.g. "N", "K", "Enter", "Space". */
  letter: string;
  /** Subtle border (default false). */
  subtle?: boolean;
  className?: string;
};

/**
 * A platform-aware keyboard chip. Render with mod={true} for Cmd/Ctrl
 * combinations, mod={false} for single keys. Hydration-safe: server
 * renders the Mac glyph (most common assumption) and swaps on mount.
 */
export function ShortcutKbd({ mod = true, letter, subtle = false, className }: Props) {
  const isMac = useIsMac();
  const label = mod ? (isMac ? `⌘${letter}` : `Ctrl+${letter}`) : letter;

  return (
    <kbd
      suppressHydrationWarning
      className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${className ?? ""}`}
      style={{
        borderColor: subtle ? "var(--color-border)" : "var(--color-border-strong)",
        background: "var(--color-page)",
        color: "var(--color-tertiary)",
      }}
    >
      {label}
    </kbd>
  );
}
