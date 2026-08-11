import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CampaignShell, SectionKicker } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { ARCHETYPES, SCOUT_QUESTIONS } from "@/lib/content";
import { useCampaignStore } from "@/lib/campaign-store";
import { cn } from "@/lib/utils";
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
  } = useCampaignStore();
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(scoutComplete);

  const q = SCOUT_QUESTIONS[step];
  const answered = scoutAnswers[q?.id ?? ""] !== undefined;
  const allAnswered = SCOUT_QUESTIONS.every(
    (question) => scoutAnswers[question.id] !== undefined,
  );

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
    completeScout();
    setRevealed(true);
  }

  if (revealed && archetype) {
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

          <div className="mt-8 space-y-4">
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
            A reading, not a cage — the campaign will test and refine it. Full
            Monday move and Nine Faces wait after the path.
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
        <p className="mt-3 max-w-xl font-body text-charcoal-muted">
          Six questions about how you actually run a book — not how you wish you
          sounded. Your reading will name your strengths and where production
          tends to leak.
        </p>

        <div className="mt-8 flex gap-1.5" aria-hidden>
          {SCOUT_QUESTIONS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-brass" : "bg-charcoal/10",
              )}
            />
          ))}
        </div>

        {q ? (
          <div className="mt-10">
            <p className="font-ui text-xs uppercase tracking-[0.2em] text-charcoal-soft">
              Question {step + 1} of {SCOUT_QUESTIONS.length}
            </p>
            <h2 className="mt-3 font-display text-2xl text-charcoal leading-snug">
              {q.prompt}
            </h2>
            <div className="mt-6 grid gap-2">
              {q.options.map((opt, i) => {
                const selected = scoutAnswers[q.id] === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectOption(i)}
                    className={cn(
                      "rounded-lg border px-4 py-3.5 text-left font-ui text-sm leading-snug transition-colors min-h-11",
                      selected
                        ? "border-brass bg-brass/10 text-ink"
                        : "border-charcoal/12 bg-parchment/70 hover:border-brass/40",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                Back
              </Button>
              <Button
                variant="paper"
                size="lg"
                disabled={
                  !answered ||
                  (step === SCOUT_QUESTIONS.length - 1 &&
                    !allAnswered &&
                    !answered)
                }
                onClick={next}
              >
                {step === SCOUT_QUESTIONS.length - 1
                  ? "Reveal my reading"
                  : "Continue"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </CampaignShell>
  );
}
