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
} from "lucide-react";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";
import { clearDecisions } from "@/lib/decisions";

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

  // Close on Escape
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[18vh]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="w-full max-w-[560px] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              label="Command Palette"
              className="rounded-xl border border-[var(--color-border-strong)] bg-elevated shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
                <Search size={16} className="text-tertiary" />
                <Command.Input
                  autoFocus
                  placeholder="Type a command or search initiatives…"
                  className="flex-1 bg-transparent text-sm text-primary placeholder:text-tertiary outline-none"
                />
                <kbd className="rounded border border-[var(--color-border-strong)] bg-page px-1.5 py-0.5 font-mono text-[10px] text-tertiary">
                  Esc
                </kbd>
              </div>
              <Command.List className="max-h-[360px] overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-tertiary">
                  No results.
                </Command.Empty>

                <Command.Group
                  heading="Decisions"
                  className="cmd-group"
                >
                  {initiatives
                    .filter((i) => i.status === "needs_decision")
                    .map((i) => (
                      <Command.Item
                        key={i.id}
                        value={`decide ${i.title}`}
                        onSelect={() => go(`/initiative/${i.id}/`)}
                        className="cmd-item"
                      >
                        <span className="text-tertiary">→</span>
                        <span>Decide on {i.title}</span>
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
                      <Layers size={14} className="text-tertiary" />
                      <span>Render plan for {a.label}</span>
                    </Command.Item>
                  ))}
                  <Command.Item
                    value="show conflicts"
                    onSelect={() => go("/quarter/?filter=conflicts")}
                    className="cmd-item"
                  >
                    <TriangleAlert size={14} className="text-tertiary" />
                    <span>Show conflicts</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="System" className="cmd-group">
                  <Command.Item
                    value="show audit log"
                    onSelect={() => go("/audit/")}
                    className="cmd-item"
                  >
                    <History size={14} className="text-tertiary" />
                    <span>Audit log — see system learning</span>
                  </Command.Item>
                  <Command.Item
                    value="show architecture"
                    onSelect={() => go("/architecture/")}
                    className="cmd-item"
                  >
                    <GitBranch size={14} className="text-tertiary" />
                    <span>Show architecture</span>
                  </Command.Item>
                  <Command.Item
                    value="reset demo"
                    onSelect={() => {
                      clearDecisions();
                      onClose();
                      router.push("/");
                    }}
                    className="cmd-item"
                  >
                    <RefreshCw size={14} className="text-tertiary" />
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
