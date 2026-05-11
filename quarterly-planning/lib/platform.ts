"use client";

import { useEffect, useState } from "react";

/**
 * Detect mod-key platform at runtime. SSR returns Mac (matches the
 * pre-existing labels so static export hydration doesn't flash).
 */
export function useIsMac(): boolean {
  const [isMac, setIsMac] = useState<boolean>(true);
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent || navigator.platform || "";
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(ua));
  }, []);
  return isMac;
}

export const MOD_GLYPH = { mac: "⌘", win: "Ctrl" } as const;

export function modKeyLabel(isMac: boolean, key: string): string {
  // `key` is the letter or symbol — "N", "K", "Enter" etc.
  return isMac ? `${MOD_GLYPH.mac}${key}` : `${MOD_GLYPH.win}+${key}`;
}
