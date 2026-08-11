import { useHydrated } from "@/lib/use-hydrated";
import { CampaignShell } from "@/components/shell";

/** Block route guards until local campaign state is rehydrated. */
export function CampaignGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <CampaignShell>
        <p className="font-ui text-sm text-charcoal-muted animate-fade-up">
          Opening the campaign journal…
        </p>
      </CampaignShell>
    );
  }
  return <>{children}</>;
}
