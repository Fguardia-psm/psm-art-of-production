import { track } from "@/lib/analytics";
import { useState } from "react";
import {
  createFileRoute,
  Link,
  Navigate,
  useNavigate,
} from "@tanstack/react-router";
import {
  CampaignShell,
  MarkWell,
  QuotePlate,
  SectionKicker,
} from "@/components/shell";
import { CampaignGate } from "@/components/campaign-gate";
import { ChapterInteractionPanel } from "@/components/chapter-interactions";
import { Button } from "@/components/ui/button";
import {
  ARCHETYPES,
  CHAPTER_WATCHPOINTS,
  REQUIRED_CHAPTERS,
  getChapter,
  type ChapterResult,
  type ChapterSlug,
} from "@/lib/content";
import { useCampaignStore } from "@/lib/campaign-store";
import { useScrollToTopOnChange } from "@/components/scroll-to-top";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/chapter/$slug")({
  component: ChapterPage,
});

function ChapterPage() {
  return (
    <CampaignGate>
      <ChapterPageInner />
    </CampaignGate>
  );
}

function ChapterPageInner() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const chapter = getChapter(slug);
  const { scoutComplete, completedChapters, completeChapter, provisionalArchetype } =
    useCampaignStore();
  const [resolved, setResolved] = useState(false);
  useScrollToTopOnChange(resolved ? `${slug}-sealed` : slug);
  const archTip = provisionalArchetype
    ? ARCHETYPES[provisionalArchetype]
    : null;

  if (!scoutComplete) return <Navigate to="/scout" />;
  if (!chapter) return <Navigate to="/map" />;

  if (!chapter.optional) {
    const index = REQUIRED_CHAPTERS.findIndex((c) => c.slug === chapter.slug);
    if (index > 0) {
      const prev = REQUIRED_CHAPTERS[index - 1]!;
      if (!completedChapters.includes(prev.slug)) {
        return <Navigate to="/map" />;
      }
    }
  } else {
    const requiredDone = REQUIRED_CHAPTERS.every((c) =>
      completedChapters.includes(c.slug),
    );
    if (!requiredDone) return <Navigate to="/map" />;
  }

  const alreadyDone = completedChapters.includes(chapter.slug as ChapterSlug);
  const reqIndex = REQUIRED_CHAPTERS.findIndex((c) => c.slug === chapter.slug);
  const nextRequired =
    reqIndex >= 0 ? REQUIRED_CHAPTERS[reqIndex + 1] : undefined;

  function onResolved(result: ChapterResult) {
    completeChapter(chapter!.slug, result);
    track("chapter_seal", { slug: chapter!.slug, result });
    setResolved(true);
  }

  function continueOn() {
    if (nextRequired) {
      navigate({ to: "/chapter/$slug", params: { slug: nextRequired.slug } });
    } else if (!chapter!.optional) {
      navigate({ to: "/nine-faces" });
    } else {
      navigate({ to: "/map" });
    }
  }

  return (
    <CampaignShell>
      <article className="space-y-8 animate-fade-up">
        <div>
          <SectionKicker>
            {chapter.optional ? "Deep campaign" : "Chapter"} {chapter.number}
          </SectionKicker>
          <h1 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
            {chapter.title}
          </h1>
          <p className="mt-2 font-display text-sm title-spaced text-charcoal-soft">
            {chapter.spacedTitle}
          </p>
        </div>

        <QuotePlate quote={chapter.quote} sub={chapter.quoteSub} />

        {archTip ? (
          <aside className="rounded-lg border border-brass/25 bg-brass/8 px-4 py-3">
            <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass">
              {archTip.name} · watchpoint
            </p>
            <p className="mt-1 font-body text-sm text-charcoal leading-relaxed">
              {CHAPTER_WATCHPOINTS[chapter.slug as ChapterSlug]?.[
                provisionalArchetype!
              ] ?? archTip.seasonFocus}
            </p>
          </aside>
        ) : null}

        <section className="space-y-4">
          <h2 className="font-ui text-[11px] uppercase tracking-[0.22em] text-brass">
            The situation
          </h2>
          <p className="font-body text-charcoal leading-relaxed">
            {chapter.situation}
          </p>
          <p className="font-body text-charcoal-muted leading-relaxed">
            {chapter.principle}
          </p>
        </section>

        <section className="rounded-xl border border-charcoal/10 bg-parchment/70 p-5 sm:p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-ui text-[11px] uppercase tracking-[0.22em] text-brass mb-4">
            Field exercise
          </h2>
          <ChapterInteractionPanel
            interaction={chapter.interaction}
            onResolved={onResolved}
          />
        </section>

        {alreadyDone && !resolved ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <p className="font-ui text-xs text-charcoal-soft self-center">
              This campaign is already sealed on this device.
            </p>
            <Button variant="outline" size="lg" onClick={continueOn}>
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        ) : null}

        {resolved && (
          <div className="space-y-6 animate-fade-up">
            <MarkWell>{chapter.markWell}</MarkWell>
            <aside className="rounded-lg border border-charcoal/10 bg-ink/[0.03] px-5 py-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass mb-2">
                Master’s field note
              </p>
              <p className="font-body text-sm text-charcoal-muted leading-relaxed">
                {chapter.fieldNote}
              </p>
            </aside>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="paper" size="lg" onClick={continueOn}>
                {nextRequired
                  ? "Next chapter"
                  : chapter.optional
                    ? "Return to map"
                    : "The Nine Faces"}
                <ArrowRight className="size-4" />
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/map">Campaign map</Link>
              </Button>
            </div>
          </div>
        )}
      </article>
    </CampaignShell>
  );
}
