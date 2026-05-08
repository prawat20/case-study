"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { AUDIENCES } from "@/lib/stakeholder-artifacts";

export default function StakeholdersHubPage() {
  return (
    <div className="min-h-screen text-primary" style={{ background: "var(--color-page)" }}>
      <Header />

      <main className="mx-auto max-w-[720px] px-6 pt-10 pb-24">
        <p className="eyebrow">Stakeholders</p>
        <h1
          className="font-display mt-2 text-[28px] leading-tight tracking-tight"
          style={{ color: "var(--color-primary)", fontWeight: 500 }}
        >
          One plan, four shapes.
        </h1>
        <p className="mt-2 text-[14px]" style={{ color: "var(--color-secondary)" }}>
          Each artifact is generated from your committed Q3 plan — written for the audience,
          not just filtered for them. Open one, copy as Slack or email, paste.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AUDIENCES.map((a, idx) => (
            <motion.div
              key={a.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: 0.08 + idx * 0.06 }}
            >
              <Link
                href={`/stakeholders/${a.key}/`}
                className="group block rounded-xl px-5 py-5 transition"
                style={{
                  background: "var(--color-elevated)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                    style={{
                      background: "var(--color-accent-soft)",
                      color: "var(--color-accent)",
                    }}
                  >
                    <Users size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[15px] font-semibold tracking-tight"
                      style={{ color: "var(--color-primary)" }}
                    >
                      For {a.label}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
                      {a.blurb}
                    </p>
                    <p className="mt-3 text-[11.5px]" style={{ color: "var(--color-tertiary)" }}>
                      {a.format}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-1 text-[12.5px] font-medium" style={{ color: "var(--color-accent)" }}>
                  <span>Generate</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div
          className="mt-10 rounded-xl px-5 py-4 text-[12.5px]"
          style={{
            background: "var(--color-surface-sunken)",
            color: "var(--color-tertiary)",
          }}
        >
          Lock the calendar plan first ( <Link href="/calendar/" style={{ color: "var(--color-accent)" }} className="underline-offset-2 hover:underline">open Calendar</Link> → Snap as Q3 plan ) so artifacts reflect the latest sequencing.
        </div>
      </main>
    </div>
  );
}
