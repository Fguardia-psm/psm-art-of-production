import { track } from "@/lib/analytics";
import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CampaignShell, SectionKicker } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { ARCHETYPES, SCOUT_QUESTIONS, type BookStage } from "@/lib/content";
import { useCampaignStore } from "@/lib/campaign-store";
import { cn } from "@/lib/utils";
import { ProductionForecastPanel } from "@/components/production-forecast";
import { useScrollToTopOnChange } from "@/components/scroll-to-top";
import {
  STAGE_OPTIONS,
  getStageAdjustedForecast,
  getSuspectedFieldLeak,
} from "@/lib/field-leader-brief";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/scout")({
  component: ScoutPage,
});

function ScoutPage() {
  const navigate = useNavigate();
  const {
    scoutAnswers,
    setScoutAnswer,
    completeScout,
    provisionalArchetype,
    scoutComplete,
    bookStage,
    setBookStage,
  } = useCampaignStore();
  const [step, setStep] = useState(0);
  const [pickingStage, setPickingStage] = useState(false);
  const [revealed, setRevealed] = useState(scoutComplete && Boolean(bookStage));
  useScrollToTopOnChange(
    revealed ? "reveal" : pickingStage ? "stage" : `scout-${step}`,
  );

  const q = SCOUT_QUESTIONS[step];

  const archetype = useMemo(() => {
    if (!provisionalArchetype) return null;
    return ARCHETYPES[provisionalArchetype];
  }, [provisionalArchetype]);

  function selectOption(optionIndex: number) {
    if (!q) return;
    setScoutAnswer(q.id, optionIndex);
  }

  function next() {
    if (step < SCOUT_QUESTIONS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    // Stage signal before reveal (P1) — one question, no new route
    completeScout();
    const arch =
      useCampaignStore.getState().provisionalArchetype ?? "unknown";
    track("scout_complete", { archetype: arch });
    if (!useCampaignStore.getState().bookStage) {
      setPickingStage(true);
      return;
    }
    setRevealed(true);
  }

  function chooseStage(stage: BookStage) {
    setBookStage(stage);
    track("stage_selected", { stage });
    setPickingStage(false);
    setRevealed(true);
  }

  if (pickingStage) {
    return (
      <CampaignShell tone="ink">
        <div className="mx-auto max-w-xl animate-fade-up">
          <SectionKicker ink>One more signal</SectionKicker>
          <h1 className="mt-3 font-display text-3xl text-parchment sm:text-4xl">
            Which field are you standing in right now?
          </h1>
          <p className="mt-3 font-body text-sm text-parchment/60 leading-relaxed">
            This shapes your next mission only — not a new path. Same campaign.
            Clearer orders for your ground.
          </p>
          <ul className="mt-8 space-y-3">
            {STAGE_OPTIONS.map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => chooseStage(opt.id)}
                  className={cn(
                    "w-full rounded-xl border border-parchment/15 bg-parchment/[0.04] px-5 py-4 text-left transition",
                    "hover:border-brass/40 hover:bg-brass/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/50",
                  )}
                >
                  <span className="font-body text-sm text-parchment leading-snug">
                    {opt.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </CampaignShell>
    );
  }

  if (revealed && archetype) {
    const stage = useCampaignStore.getState().bookStage;
    const forecast = getStageAdjustedForecast(archetype.id, stage);
    const leak = getSuspectedFieldLeak(archetype.id);

    return (
      <CampaignShell tone="ink">
        <div className="mx-auto max-w-xl animate-fade-up">
          <div className="text-center">
            <SectionKicker ink>Your field reading</SectionKicker>
            <p className="mt-4 font-ui text-[11px] uppercase tracking-[0.24em] text-parchment/45">
              How you tend to win
            </p>
            <h1 className="mt-3 font-display text-4xl text-parchment sm:text-5xl">
              {archetype.name}
            </h1>
            <p className="mt-3 font-display text-lg italic text-brass-bright/90">
              {archetype.epithet}
            </p>
          </div>

          <p className="mt-8 font-body text-parchment/75 leading-relaxed text-[1.05rem]">
            {archetype.fieldReading}
          </p>

          <div className="mt-6 rounded-xl border border-brass/30 bg-brass/10 px-5 py-4">
            <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass-bright">
              Exposed flank this season
            </p>
            <p className="mt-2 font-body text-sm text-parchment/85 leading-relaxed">
              {leak}
            </p>
          </div>

          <div className="mt-8">
            <ProductionForecastPanel forecast={forecast} tone="ink" />
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-parchment/12 bg-parchment/[0.04] px-5 py-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass-bright/90">
                At your best
              </p>
              <p className="mt-2 font-body text-sm text-parchment/70 leading-relaxed">
                {archetype.atYourBest}
              </p>
            </div>
            <div className="rounded-xl border border-parchment/12 bg-parchment/[0.04] px-5 py-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass-bright/90">
                Where production leaks
              </p>
              <p className="mt-2 font-body text-sm text-parchment/70 leading-relaxed">
                {archetype.whenYouStruggle}
              </p>
            </div>
            <div className="rounded-xl border border-brass/35 bg-brass/10 px-5 py-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass-bright">
                This season’s focus
              </p>
              <p className="mt-2 font-body text-sm text-parchment/80 leading-relaxed">
                {archetype.seasonFocus}
              </p>
            </div>
          </div>

          <p className="mt-6 font-display text-base italic text-parchment/50 text-center">
            “{archetype.seal}”
          </p>
          <p className="mt-4 font-body text-xs text-parchment/40 text-center leading-relaxed">
            A reading, not a cage. Walk the campaigns next — you’ll leave with a
            next mission you can run without this screen.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate({ to: "/map" })}
            >
              Enter the campaign map
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </CampaignShell>
    );
  }

  return (
    <CampaignShell>
      <div className="animate-fade-up">
        <SectionKicker>Field scout</SectionKicker>
        <h1 className="mt-3 font-display text-3xl text-charcoal sm:text-4xl">
          How do you win?
        </h1>
        <p className="mt-2 font-body text-charcoal-muted leading-relaxed max-w-xl">
          Six questions. No traps. We find how you tend to win on the field —
          then give you a next mission, not a label to wear.
        </p>

        <div className="mt-8 rounded-xl border border-charcoal/10 bg-parchment/80 p-5 sm:p-6">
          <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass tabular-nums">
            Question {step + 1} of {SCOUT_QUESTIONS.length}
          </p>
          <p className="mt-3 font-display text-xl text-charcoal leading-snug">
            {q?.prompt}
          </p>
          <ul className="mt-5 space-y-2">
            {q?.options.map((opt, i) => {
              const selected = scoutAnswers[q.id] === i;
              return (
                <li key={opt.label}>
                  <button
                    type="button"
                    onClick={() => selectOption(i)}
                    className={cn(
                      "w-full rounded-lg border px-4 py-3 text-left font-body text-sm leading-snug transition",
                      selected
                        ? "border-brass bg-brass/10 text-charcoal"
                        : "border-charcoal/12 bg-parchment text-charcoal-muted hover:border-brass/40",
                    )}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={scoutAnswers[q?.id ?? ""] === undefined}
              onClick={next}
            >
              {step < SCOUT_QUESTIONS.length - 1 ? "Next" : "See your reading"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </CampaignShell>
  );
}
