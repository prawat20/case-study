"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Layers,
  GitBranch,
  RefreshCw,
  TriangleAlert,
  History,
  Plus,
  Inbox as InboxIcon,
  Calendar as CalendarIcon,
  Sun,
  Moon,
  Home,
} from "lucide-react";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";
import { clearDecisions, clearFrameworkOverrides } from "@/lib/decisions";
import { clearTriage } from "@/lib/triage";
import { clearCaptures } from "@/lib/captures";
import { useCommandPalette } from "@/components/CommandProvider";

const initiatives = initiativesJson as Initiative[];

const audiences = [
  { key: "all", label: "All" },
  { key: "exec", label: "Exec" },
  { key: "eng", label: "Eng" },
  { key: "sales", label: "Sales" },
  { key: "cs", label: "CS" },
];

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { openCapture } = useCommandPalette();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function go(path: string) {
    onClose();
    router.push(path);
  }

  function setTheme(t: "light" | "dark") {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("qp_theme_v2", t);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh]"
          style={{
            background: "rgba(26, 24, 21, 0.32)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[560px] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              label="Command Palette"
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <Search size={16} style={{ color: "var(--color-tertiary)" }} />
                <Command.Input
                  autoFocus
                  placeholder="Type a command or search…"
                  className="flex-1 bg-transparent text-[14px] outline-none placeholder:opacity-50"
                  style={{ color: "var(--color-primary)" }}
                />
                <kbd
                  className="rounded border px-1.5 py-0.5 font-mono text-[10px]"
                  style={{
                    borderColor: "var(--color-border-strong)",
                    background: "var(--color-page)",
                    color: "var(--color-tertiary)",
                  }}
                >
                  Esc
                </kbd>
              </div>
              <Command.List className="max-h-[420px] overflow-y-auto p-2">
                <Command.Empty
                  className="py-6 text-center text-[13px]"
                  style={{ color: "var(--color-tertiary)" }}
                >
                  No results.
                </Command.Empty>

                <Command.Group heading="Inbox" className="cmd-group">
                  <Command.Item
                    value="capture an ask new"
                    onSelect={() => {
                      onClose();
                      setTimeout(() => openCapture(), 120);
                    }}
                    className="cmd-item"
                  >
                    <Plus size={14} style={{ color: "var(--color-tertiary)" }} />
                    <span>Capture an ask</span>
                    <span className="ml-auto font-mono text-[10px]" style={{ color: "var(--color-muted)" }}>⌘N</span>
                  </Command.Item>
                  <Command.Item
                    value="run triage start"
                    onSelect={() => go("/inbox/triage/")}
                    className="cmd-item"
                  >
                    <InboxIcon size={14} style={{ color: "var(--color-tertiary)" }} />
                    <span>Run triage</span>
                  </Command.Item>
                  <Command.Item
                    value="open inbox list"
                    onSelect={() => go("/inbox/")}
                    className="cmd-item"
                  >
                    <InboxIcon size={14} style={{ color: "var(--color-tertiary)" }} />
                    <span>Open inbox</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Navigate" className="cmd-group">
                  <Command.Item
                    value="now home"
                    onSelect={() => go("/")}
                    className="cmd-item"
                  >
                    <Home size={14} style={{ color: "var(--color-tertiary)" }} />
                    <span>Now</span>
                  </Command.Item>
                  <Command.Item
                    value="calendar quarter"
                    onSelect={() => go("/quarter/")}
                    className="cmd-item"
                  >
                    <CalendarIcon size={14} style={{ color: "var(--color-tertiary)" }} />
                    <span>Calendar</span>
                  </Command.Item>
                  <Command.Item
                    value="audit log"
                    onSelect={() => go("/audit/")}
                    className="cmd-item"
                  >
                    <History size={14} style={{ color: "var(--color-tertiary)" }} />
                    <span>Audit log</span>
                  </Command.Item>
                  <Command.Item
                    value="architecture system map"
                    onSelect={() => go("/architecture/")}
                    className="cmd-item"
                  >
                    <GitBranch size={14} style={{ color: "var(--color-tertiary)" }} />
                    <span>Architecture</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Decisions" className="cmd-group">
                  {initiatives
                    .filter((i) => i.status === "needs_decision")
                    .slice(0, 5)
                    .map((i) => (
                      <Command.Item
                        key={i.id}
                        value={`decide ${i.title}`}
                        onSelect={() => go(`/initiative/${i.id}/`)}
                        className="cmd-item"
                      >
                        <span style={{ color: "var(--color-tertiary)" }}>→</span>
                        <span>Prioritize {i.title}</span>
                      </Command.Item>
                    ))}
                </Command.Group>

                <Command.Group heading="Plan" className="cmd-group">
                  {audiences.map((a) => (
                    <Command.Item
                      key={a.key}
                      value={`render plan for ${a.label}`}
                      onSelect={() => go(`/quarter/?audience=${a.key}`)}
                      className="cmd-item"
                    >
                      <Layers size={14} style={{ color: "var(--color-tertiary)" }} />
                      <span>Render plan for {a.label}</span>
                    </Command.Item>
                  ))}
                  <Command.Item
                    value="show conflicts"
                    onSelect={() => go("/quarter/?filter=conflicts")}
                    className="cmd-item"
                  >
                    <TriangleAlert size={14} style={{ color: "var(--color-tertiary)" }} />
                    <span>Show conflicts</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Theme" className="cmd-group">
                  <Command.Item
                    value="theme light"
                    onSelect={() => setTheme("light")}
                    className="cmd-item"
                  >
                    <Sun size={14} style={{ color: "var(--color-tertiary)" }} />
                    <span>Switch to light theme</span>
                  </Command.Item>
                  <Command.Item
                    value="theme dark"
                    onSelect={() => setTheme("dark")}
                    className="cmd-item"
                  >
                    <Moon size={14} style={{ color: "var(--color-tertiary)" }} />
                    <span>Switch to dark theme</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="System" className="cmd-group">
                  <Command.Item
                    value="reset demo"
                    onSelect={() => {
                      clearDecisions();
                      clearFrameworkOverrides();
                      clearTriage();
                      clearCaptures();
                      onClose();
                      router.push("/");
                    }}
                    className="cmd-item"
                  >
                    <RefreshCw size={14} style={{ color: "var(--color-tertiary)" }} />
                    <span>Reset demo</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
