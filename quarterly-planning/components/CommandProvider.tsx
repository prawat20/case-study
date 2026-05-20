"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { CaptureModal } from "@/components/CaptureModal";
import { OnboardingModal } from "@/components/OnboardingModal";

type Ctx = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  isCaptureOpen: boolean;
  openCapture: () => void;
  closeCapture: () => void;
};

const CommandPaletteContext = createContext<Ctx | null>(null);

export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const inField = tag === "input" || tag === "textarea";

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCaptureOpen(false);
        setIsOpen((v) => !v);
      }

      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "n" &&
        !inField
      ) {
        e.preventDefault();
        setIsOpen(false);
        setIsCaptureOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value: Ctx = {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
    isCaptureOpen,
    openCapture: () => setIsCaptureOpen(true),
    closeCapture: () => setIsCaptureOpen(false),
  };

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette open={isOpen} onClose={() => setIsOpen(false)} />
      <CaptureModal open={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} />
      <OnboardingModal />
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    return {
      isOpen: false,
      open: () => {},
      close: () => {},
      toggle: () => {},
      isCaptureOpen: false,
      openCapture: () => {},
      closeCapture: () => {},
    };
  }
  return ctx;
}
