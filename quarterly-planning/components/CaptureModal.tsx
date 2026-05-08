"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { CornerDownLeft } from "lucide-react";
import { addCapture, inferCaptureMeta } from "@/lib/captures";
import { playCaptureChime } from "@/lib/sound";

export function CaptureModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setText("");
      setSavedFlash(false);
    }
  }, [open]);

  const submit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const meta = inferCaptureMeta(trimmed);
    addCapture({
      text: trimmed,
      source: meta.source,
      channel: meta.channel,
      signal: meta.signal,
    });
    playCaptureChime();
    setSavedFlash(true);
    setTimeout(() => onClose(), 320);
  }, [text, onClose]);

  // Esc + Enter handling
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, submit]);

  const inferred = text.trim() ? inferCaptureMeta(text) : null;

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
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-[4px] text-[11px] font-bold"
                    style={{
                      background: "var(--color-accent)",
                      color: "var(--color-elevated)",
                    }}
                  >
                    ◆
                  </span>
                  <span className="text-[13px] font-semibold" style={{ color: "var(--color-primary)" }}>
                    Capture an ask
                  </span>
                </div>
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

              <div className="px-5 pt-5 pb-4">
                <textarea
                  autoFocus
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. Sales says SAML for Acme — 3 deals stalling"
                  className="w-full resize-none bg-transparent text-[15px] outline-none placeholder:opacity-40"
                  style={{
                    color: "var(--color-primary)",
                    lineHeight: 1.55,
                    minHeight: 64,
                  }}
                />

                <div className="mt-4 flex items-center gap-2 text-[12px] min-h-[20px]" style={{ color: "var(--color-tertiary)" }}>
                  {inferred ? (
                    <>
                      <span className="eyebrow" style={{ fontSize: 10 }}>
                        Auto-detected
                      </span>
                      <Chip>{inferred.source}</Chip>
                      <Chip>{inferred.channel}</Chip>
                      <Chip accent>{inferred.signal}</Chip>
                    </>
                  ) : (
                    <span style={{ color: "var(--color-muted)" }}>
                      Source &amp; signal will auto-detect as you type.
                    </span>
                  )}
                </div>
              </div>

              <div
                className="flex items-center justify-between px-5 py-3"
                style={{
                  borderTop: "1px solid var(--color-border)",
                  background: "var(--color-page)",
                }}
              >
                <span className="text-[11.5px]" style={{ color: "var(--color-tertiary)" }}>
                  {savedFlash ? "Captured." : `${text.length} chars`}
                </span>
                <button
                  onClick={submit}
                  disabled={!text.trim()}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition disabled:opacity-40"
                  style={{
                    background: text.trim() ? "var(--color-accent)" : "var(--color-surface-sunken)",
                    color: text.trim() ? "var(--color-elevated)" : "var(--color-muted)",
                  }}
                >
                  Capture
                  <CornerDownLeft size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Chip({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium"
      style={{
        background: accent ? "var(--color-accent-soft)" : "var(--color-surface-sunken)",
        color: accent ? "var(--color-accent)" : "var(--color-secondary)",
      }}
    >
      {children}
    </span>
  );
}
