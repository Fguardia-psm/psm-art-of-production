import { useEffect, useState } from "react";
import { useCampaignStore } from "@/lib/campaign-store";

/**
 * True only after mount + zustand persist rehydration.
 * Always starts false on server and first client paint so SSR HTML matches
 * (avoids hydration mismatch on gated campaign routes).
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      if (useCampaignStore.persist.hasHydrated()) {
        setHydrated(true);
        return;
      }
      const unsub = useCampaignStore.persist.onFinishHydration(() => {
        setHydrated(true);
      });
      if (useCampaignStore.persist.hasHydrated()) setHydrated(true);
      return unsub;
    } catch {
      setHydrated(true);
    }
  }, []);

  return hydrated;
}
