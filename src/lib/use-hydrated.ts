import { useEffect, useState } from "react";
import { useCampaignStore } from "@/lib/campaign-store";

/**
 * True only after zustand-persist has rehydrated from localStorage.
 * Without this, gated routes Navigate away on first paint (empty default
 * state) and agents lose mid-campaign progress on refresh / deep link.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return useCampaignStore.persist.hasHydrated();
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (useCampaignStore.persist.hasHydrated()) {
        setHydrated(true);
        return;
      }
      const unsub = useCampaignStore.persist.onFinishHydration(() => {
        setHydrated(true);
      });
      // Fallback if hydration already finished between check and subscribe
      if (useCampaignStore.persist.hasHydrated()) setHydrated(true);
      return unsub;
    } catch {
      setHydrated(true);
    }
  }, []);

  return hydrated;
}
