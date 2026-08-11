import { useState } from "react";
import {
  hasCampaignProgress,
  startOverCampaign,
  useCampaignStore,
} from "@/lib/campaign-store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { track } from "@/lib/analytics";

const CONFIRM_COPY =
  "Start over? This clears your saved campaign on this device.\n\nSeals, scout answers, Nine Faces, and dossier progress will be wiped.\n\nThis cannot be undone.";

type Variant = "header" | "inline" | "landing" | "danger";

/** Start over — clears local campaign progress on this device. */
export function StartOverControl({
  variant = "inline",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const hydrated = useHydrated();
  const state = useCampaignStore();
  const [busy, setBusy] = useState(false);

  if (!hydrated || !hasCampaignProgress(state)) return null;

  function run() {
    if (busy) return;
    if (!window.confirm(CONFIRM_COPY)) return;
    setBusy(true);
    track("start_over");
    startOverCampaign();
  }

  if (variant === "header") {
    return (
      <button
        type="button"
        onClick={run}
        disabled={busy}
        title="Clear progress and start over"
        className={cn(
          "font-ui text-[10px] uppercase tracking-[0.16em] underline-offset-2 hover:underline disabled:opacity-50",
          className,
        )}
      >
        {busy ? "Resetting…" : "Start over"}
      </button>
    );
  }

  if (variant === "landing") {
    return (
      <Button
        type="button"
        variant="secondary"
        size="lg"
        onClick={run}
        disabled={busy}
        className={className}
      >
        <RotateCcw className="size-4" />
        {busy ? "Resetting…" : "Start over"}
      </Button>
    );
  }

  if (variant === "danger") {
    return (
      <div
        className={cn(
          "rounded-xl border border-charcoal/15 bg-charcoal/5 px-4 py-4",
          className,
        )}
      >
        <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-charcoal-soft">
          Start over
        </p>
        <p className="mt-2 font-body text-sm text-charcoal-muted leading-relaxed">
          Wipe seals and progress on this device and return to the beginning.
          NPN already filed cannot be unsent.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={run}
          disabled={busy}
        >
          <RotateCcw className="size-3.5" />
          {busy ? "Resetting…" : "Reset campaign"}
        </Button>
      </div>
    );
  }

  // inline default
  return (
    <button
      type="button"
      onClick={run}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-1.5 font-ui text-xs text-charcoal-soft underline underline-offset-2 hover:text-charcoal disabled:opacity-50",
        className,
      )}
    >
      <RotateCcw className="size-3.5" />
      {busy ? "Resetting…" : "Start over"}
    </button>
  );
}
