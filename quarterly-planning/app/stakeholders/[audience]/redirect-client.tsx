"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AudienceKey } from "@/lib/stakeholder-artifacts";

/**
 * Client-side redirector for legacy /stakeholders/[audience] deep-links.
 * Bounces to /stakeholders/?audience=<key> so the unified master/detail
 * surface lands with the right tab selected.
 */
export function AudienceRedirect({ audience }: { audience: AudienceKey | null }) {
  const router = useRouter();

  useEffect(() => {
    if (audience) {
      router.replace(`/stakeholders/?audience=${audience}`);
    } else {
      router.replace("/stakeholders/");
    }
  }, [audience, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center text-[13px]"
      style={{ background: "var(--color-page)", color: "var(--color-tertiary)" }}
    >
      Opening Stakeholders…
    </div>
  );
}
