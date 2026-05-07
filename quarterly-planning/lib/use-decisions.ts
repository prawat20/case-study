"use client";

import { useEffect, useState } from "react";
import {
  DECISIONS_EVENT,
  getDecisions,
  type Decision,
} from "@/lib/decisions";

export function useDecisions() {
  const [decisions, setDecisionsState] = useState<Decision[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDecisionsState(getDecisions());
    setHydrated(true);

    const handler = () => setDecisionsState(getDecisions());
    window.addEventListener(DECISIONS_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(DECISIONS_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { decisions, hydrated };
}
