"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * /inbox was merged into Now in the v3 flow consolidation.
 * Keep this route as a transparent redirect so old links and browser
 * back-navigation still resolve to the unified home surface.
 */
export default function InboxRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return (
    <div
      className="min-h-screen flex items-center justify-center text-[13px]"
      style={{ background: "var(--color-page)", color: "var(--color-tertiary)" }}
    >
      Redirecting to Now…
    </div>
  );
}
