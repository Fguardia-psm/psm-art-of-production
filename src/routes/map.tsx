import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  CampaignShell,
  ReadinessPlate,
  SectionKicker,
} from "@/components/shell";
import { CampaignGate } from "@/components/campaign-gate";
import { Button } from "@/components/ui/button";
import {
  OPTIONAL_CHAPTERS,
  REQUIRED_CHAPTERS,
  ARCHETYPES,
  resultLabel,
} from "@/lib/content";
import { requiredProgress, useCampaignStore } from "@/lib/campaign-store";
import { computeReadiness } from "@/lib/readiness";
import { cn } from "@/lib/utils";
import { Check, Lock, ArrowRight, Star } from "lucide-react";

export const Route = createFileRoute("/map")({
  component: MapPage,
});

function MapPage() {
  return (
    <CampaignGate>
      <MapPageInner />
    </CampaignGate>
  );
}

function MapPageInner() {
  const state = useCampaignStore();
  if (!state.scoutComplete) {
    return <Navigate to="/scout" />;
  }

  const progress = requiredProgress(state);
  const readiness = computeReadiness(state);
  const archetype = state.provisionalArchetype
    ? ARCHETYPES[state.provisionalArchetype]
    : null;

  const nextChapter = REQUIRED_CHAPTERS.find(
    (c) => !state.completedChapters.includes(c.slug),
  );
  const deepUnlocked = progress.chaptersDone >= REQUIRED_CHAPTERS.length;

  return (
    <CampaignShell>
      <div className="animate-fade-up">
        <SectionKicker>Campaign Map</SectionKicker>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl text-charcoal sm:text-4xl">
              Your campaign path
            </h1>
            <p className="mt-2 font-body text-charcoal-muted max-w-lg">
              Five field campaigns, then nine client types. Each seal is a
              production skill you practiced — prep, no-pressure sits, pipeline
              ground, day order, and marketing.
            </p>
          </div>
          {archetype ? (
            <p className="font-ui text-xs uppercase tracking-[0.18em] text-brass shrink-0">
              {archetype.name}
            </p>
          ) : null}
        </div>

        {archetype ? (
          <div className="mt-6 rounded-xl border border-brass/25 bg-brass/8 px-4 py-4">
            <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass">
              Your reading · {archetype.name}
            </p>
            <p className="mt-2 font-body text-sm text-charcoal leading-relaxed">
              {archetype.seasonFocus}
            </p>
          </div>
        ) : null}

        <div className="mt-6">
          <ReadinessPlate
            score={readiness.score}
            label={readiness.label}
            parts={readiness.parts}
          />
        </div>

        <div className="relative mt-10">
          <div
            className="absolute left-[22px] top-3 bottom-3 w-px map-path-line sm:left-[23px]"
            aria-hidden
          />
          <ol className="relative space-y-3">
            {REQUIRED_CHAPTERS.map((chapter, index) => {
              const done = state.completedChapters.includes(chapter.slug);
              const prevDone =
                index === 0 ||
                state.completedChapters.includes(
                  REQUIRED_CHAPTERS[index - 1]!.slug,
                );
              const locked = !prevDone && !done;
              const result = state.chapterResults[chapter.slug];

              return (
                <li key={chapter.slug}>
                  {locked ? (
                    <div className="flex items-center gap-4 rounded-xl border border-charcoal/10 bg-parchment/40 px-4 py-4 opacity-60">
                      <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-charcoal/20 bg-parchment">
                        <Lock className="size-4 text-charcoal-soft" />
                      </span>
                      <div>
                        <p className="font-ui text-[10px] tracking-[0.2em] text-charcoal-soft">
                          Chapter {chapter.number} · fog of war
                        </p>
                        <p className="font-display text-xl text-charcoal">
                          {chapter.title}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to="/chapter/$slug"
                      params={{ slug: chapter.slug }}
                      className={cn(
                        "flex items-center gap-4 rounded-xl border px-4 py-4 transition-colors",
                        done
                          ? "border-brass/35 bg-brass/8 hover:bg-brass/12"
                          : "border-charcoal/12 bg-parchment/80 hover:border-brass/40",
                      )}
                    >
                      <span
                        className={cn(
                          "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border font-ui text-xs",
                          done
                            ? "border-brass bg-brass text-ink seal-stamp"
                            : "border-charcoal/20 bg-parchment text-charcoal-muted",
                        )}
                      >
                        {done ? (
                          <Check className="size-4" strokeWidth={2.5} />
                        ) : (
                          chapter.number
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-ui text-[10px] tracking-[0.2em] text-charcoal-soft">
                          Chapter {chapter.number}
                          {result ? ` · ${resultLabel(result)} seal` : ""}
                        </p>
                        <p className="font-display text-xl text-charcoal truncate">
                          {chapter.title}
                        </p>
                      </div>
                      <ArrowRight className="size-4 text-charcoal-soft shrink-0" />
                    </Link>
                  )}
                </li>
              );
            })}

            <li>
              {!deepUnlocked ? (
                <div className="flex items-center gap-4 rounded-xl border border-charcoal/10 bg-parchment/40 px-4 py-4 opacity-60">
                  <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-charcoal/20 bg-parchment">
                    <Lock className="size-4 text-charcoal-soft" />
                  </span>
                  <div>
                    <p className="font-ui text-[10px] tracking-[0.2em] text-charcoal-soft">
                      Master scene · fog of war
                    </p>
                    <p className="font-display text-xl text-charcoal">
                      The Nine Faces
                    </p>
                  </div>
                </div>
              ) : (
                <Link
                  to="/nine-faces"
                  className={cn(
                    "flex items-center gap-4 rounded-xl border px-4 py-4 transition-colors",
                    state.nineFacesComplete
                      ? "border-brass/35 bg-brass/8 hover:bg-brass/12"
                      : "border-charcoal/12 bg-parchment/80 hover:border-brass/40",
                  )}
                >
                  <span
                    className={cn(
                      "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border font-ui text-xs",
                      state.nineFacesComplete
                        ? "border-brass bg-brass text-ink seal-stamp"
                        : "border-charcoal/20 bg-parchment text-charcoal-muted",
                    )}
                  >
                    {state.nineFacesComplete ? (
                      <Check className="size-4" strokeWidth={2.5} />
                    ) : (
                      <Star className="size-4" strokeWidth={2} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-ui text-[10px] tracking-[0.2em] text-charcoal-soft">
                      Master scene
                      {state.nineFacesComplete
                        ? ` · ${state.nineFacesScore}/9 faces known`
                        : ""}
                    </p>
                    <p className="font-display text-xl text-charcoal">
                      The Nine Faces
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-charcoal-soft shrink-0" />
                </Link>
              )}
            </li>
          </ol>
        </div>

        {deepUnlocked ? (
          <div className="mt-10">
            <SectionKicker>Deep campaigns · optional</SectionKicker>
            <p className="mt-2 font-body text-sm text-charcoal-muted max-w-lg">
              High-protein for Field Marshals and Cartographers. Not required
              for the kit.
            </p>
            <ol className="mt-4 space-y-3">
              {OPTIONAL_CHAPTERS.map((chapter) => {
                const done = state.completedChapters.includes(chapter.slug);
                return (
                  <li key={chapter.slug}>
                    <Link
                      to="/chapter/$slug"
                      params={{ slug: chapter.slug }}
                      className={cn(
                        "flex items-center gap-4 rounded-xl border px-4 py-4 transition-colors",
                        done
                          ? "border-brass/35 bg-brass/8"
                          : "border-charcoal/12 bg-parchment/80 hover:border-brass/40",
                      )}
                    >
                      <span className="font-display text-xl text-charcoal">
                        {chapter.title}
                      </span>
                      <ArrowRight className="ml-auto size-4 text-charcoal-soft" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {nextChapter ? (
            <Button asChild variant="paper" size="lg">
              <Link to="/chapter/$slug" params={{ slug: nextChapter.slug }}>
                Continue campaign
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : !state.nineFacesComplete ? (
            <Button asChild variant="paper" size="lg">
              <Link to="/nine-faces">
                Enter the Nine Faces
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="paper" size="lg">
              <Link to={state.unlocked ? "/dossier" : "/unlock"}>
                {state.unlocked ? "Enter your field dossier" : "Seal the campaign"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </CampaignShell>
  );
}
