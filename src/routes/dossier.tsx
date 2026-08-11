import { useEffect } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  CampaignShell,
  QuotePlate,
  ReadinessPlate,
  SectionKicker,
} from "@/components/shell";
import { CampaignGate } from "@/components/campaign-gate";
import { StartOverControl } from "@/components/start-over";
import { Button } from "@/components/ui/button";
import {
  ARCHETYPES,
  PDF_URL,
  PSM_CONTACT_URL,
  RECRUITER_OPENERS,
  fieldLeaderUrl,
} from "@/lib/content";
import { useCampaignStore } from "@/lib/campaign-store";
import { computeReadiness } from "@/lib/readiness";
import { track } from "@/lib/analytics";
import { NineFacesDeck } from "@/components/nine-faces-deck";
import { ProductionForecastPanel } from "@/components/production-forecast";
import { FieldCard } from "@/components/field-card";
import { CounselHandoff } from "@/components/counsel-handoff";
import { chapterScorecard } from "@/lib/readiness";
import { recruiterIntelSummary } from "@/lib/content";
import { ArrowRight, BookOpen } from "lucide-react";

export const Route = createFileRoute("/dossier")({
  component: DossierPage,
});

function DossierPage() {
  return (
    <CampaignGate>
      <DossierPageInner />
    </CampaignGate>
  );
}

function DossierPageInner() {
  const state = useCampaignStore();
  const {
    unlocked,
    provisionalArchetype,
    lead,
    nineFacesScore,
    fieldReportsSeen,
    chapterResults,
  } = state;

  const canView = Boolean(unlocked && provisionalArchetype);
  const readiness = computeReadiness(state);
  const scorecard = chapterScorecard(chapterResults);

  useEffect(() => {
    if (!canView || !provisionalArchetype) return;
    track("dossier_view", {
      archetype: provisionalArchetype,
      readiness: readiness.score,
      nine_faces: nineFacesScore,
    });
  }, [canView, provisionalArchetype, readiness.score, nineFacesScore]);

  if (!unlocked || !provisionalArchetype) {
    return <Navigate to="/unlock" />;
  }

  const arch = ARCHETYPES[provisionalArchetype];
  const opener = RECRUITER_OPENERS[provisionalArchetype];
  const intel = {
    archetype: provisionalArchetype,
    name: lead?.name?.split(" ")[0],
    readiness: readiness.score,
    readinessLabel: readiness.label,
    nineFacesScore,
    chaptersDone: scorecard.done,
    weakestChapter: scorecard.weakest,
    strongestChapter: scorecard.strongest,
    fieldReportsSeen,
    mission: arch.forecast.mission30,
    utmContent: "dossier-counsel",
  };
  const counselHref = fieldLeaderUrl(intel);
  const intelLine = recruiterIntelSummary(intel);

  return (
    <CampaignShell>
      <div className="space-y-10 animate-fade-up">
        <div>
          <SectionKicker>Field dossier · sealed</SectionKicker>
          <h1 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
            {lead?.name
              ? `${lead.name.split(" ")[0]}, your reading is ready`
              : "Your reading is ready"}
          </h1>
          <p className="mt-2 font-body text-charcoal-muted leading-relaxed max-w-xl">
            First — who you are on the field. Then your Field Seal. Then how to
            win the next thirty days with allies who already know the ground.
          </p>
        </div>

        {/* Archetype "horoscope" — identity magic first */}
        <section className="ink-wash rounded-xl border border-brass/35 px-6 py-10 text-center shadow-[var(--shadow-plate)] sm:px-10">
          <p className="font-ui text-[11px] uppercase tracking-[0.28em] text-brass-bright/90">
            Your field reading
          </p>
          <h2 className="mt-3 font-display text-4xl text-parchment sm:text-5xl">
            {arch.name}
          </h2>
          <p className="mt-3 font-display text-lg italic text-brass-bright/90">
            {arch.epithet}
          </p>
          <p className="mx-auto mt-6 max-w-lg font-body text-parchment/70 leading-relaxed text-base sm:text-lg">
            {arch.fieldReading}
          </p>
          <div className="mx-auto mt-8 max-w-lg space-y-4 text-left">
            <div className="rounded-lg border border-parchment/10 bg-parchment/[0.04] px-4 py-3">
              <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass-bright/80">
                At your best
              </p>
              <p className="mt-1 font-body text-sm text-parchment/65 leading-relaxed">
                {arch.atYourBest}
              </p>
            </div>
            <div className="rounded-lg border border-parchment/10 bg-parchment/[0.04] px-4 py-3">
              <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass-bright/80">
                Where production leaks
              </p>
              <p className="mt-1 font-body text-sm text-parchment/65 leading-relaxed">
                {arch.whenYouStruggle}
              </p>
            </div>
            <div className="rounded-lg border border-brass/30 bg-brass/10 px-4 py-3">
              <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass-bright">
                This season's omen
              </p>
              <p className="mt-1 font-body text-sm text-parchment/80 leading-relaxed">
                {arch.seasonFocus}
              </p>
            </div>
          </div>
          <p className="mt-8 font-display text-xl italic text-brass-bright/85">
            “{arch.seal}”
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-charcoal/10 bg-parchment/70 p-5">
            <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
              Strengths on the field
            </p>
            <ul className="mt-3 space-y-2">
              {arch.strengths.map((s) => (
                <li
                  key={s}
                  className="font-body text-sm text-charcoal leading-snug"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-charcoal/10 bg-parchment/70 p-5">
            <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
              Monday move
            </p>
            <p className="mt-2 font-body text-sm text-charcoal leading-relaxed">
              {arch.mondayScript}
            </p>
            <p className="mt-4 font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
              Blind spot
            </p>
            <p className="mt-2 font-body text-sm text-charcoal-muted leading-relaxed">
              {arch.blindSpot}
            </p>
          </div>
        </div>

        <FieldCard
          arch={arch}
          readinessScore={readiness.score}
          readinessLabel={readiness.label}
          nineFacesScore={nineFacesScore}
          agentName={lead?.name}
          weakestChapter={scorecard.weakest}
          strongestChapter={scorecard.strongest}
        />

        <ProductionForecastPanel forecast={arch.forecast} />

        <ReadinessPlate
          score={readiness.score}
          label={readiness.label}
          parts={readiness.parts}
        />

        {/* War council CTA — primary conversion */}
        <section className="ink-wash rounded-xl border border-brass/40 px-6 py-8 shadow-[var(--shadow-plate)] sm:px-8">
          <p className="font-ui text-[10px] uppercase tracking-[0.28em] text-brass-bright/90">
            The art of winning · not alone
          </p>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl text-parchment leading-snug">
            Supreme excellence is to win before the battle — and with allies who
            already know the ground.
          </h2>
          <p className="mt-4 font-body text-sm text-parchment/65 leading-relaxed max-w-xl">
            Same book. Better ground. Cleaner systems. That is the economic
            case — not a pep talk. Bring your reading (
            <span className="text-brass-bright/90">{arch.name}</span>
            ) and talk to a field leader about the next season.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 max-w-xl">
            {[
              "What contracts and markets fit my book?",
              "What marketing fire can warm my ground before AEP?",
              "What systems stop me from leaking hours?",
              "How do producers like me partner without losing independence?",
            ].map((q) => (
              <li
                key={q}
                className="rounded-md border border-parchment/15 bg-parchment/[0.04] px-3 py-2 font-body text-xs text-parchment/70 leading-snug"
              >
                {q}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <CounselHandoff
              tone="ink"
              source="dossier"
              archetype={provisionalArchetype}
              readinessScore={readiness.score}
              readinessLabel={readiness.label}
              nineFacesScore={nineFacesScore}
              chaptersDone={scorecard.done}
              weakestChapter={scorecard.weakest}
              strongestChapter={scorecard.strongest}
              fieldReportsSeen={fieldReportsSeen}
              chapterResults={chapterResults}
              leaderCode={state.leaderCode}
              defaultName={lead?.name}
              defaultEmail={lead?.email}
              defaultPhone={lead?.phone}
            />
          </div>
          <div className="mt-4">
            <Button asChild variant="secondary" size="lg">
              <Link to="/field-reports">
                {fieldReportsSeen ? "Revisit Field Reports" : "Study Field Reports first"}
              </Link>
            </Button>
          </div>
          <p className="mt-4 rounded-md border border-parchment/15 bg-parchment/[0.05] px-3 py-2 font-ui text-[11px] text-parchment/55 leading-relaxed">
            <span className="text-brass-bright/90">What your wholesaler receives: </span>
            {intelLine}
          </p>
          <p className="mt-3 font-ui text-[11px] text-parchment/40">
            Or open{" "}
            <a
              href={PSM_CONTACT_URL}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-parchment/70"
            >
              psmbrokerage.com/contact
            </a>
          </p>
        </section>

        <NineFacesDeck score={nineFacesScore} />

        <aside className="rounded-xl border border-brass/30 bg-brass/8 p-5 sm:p-6">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
            Sealed reward · the manual
          </p>
          <p className="mt-2 font-body text-charcoal leading-relaxed">
            This campaign complements the article — it does not replace it. The
            PDF remains the primary source. Walk the path; own the manual.
          </p>
          <p className="mt-4 font-display text-lg italic text-charcoal">
            “{arch.seal}”
          </p>
          <Button asChild variant="paper" size="lg" className="mt-4">
            <a href={PDF_URL} target="_blank" rel="noreferrer">
              <BookOpen className="size-4" />
              Open the manual
            </a>
          </Button>
        </aside>

        <aside className="rounded-xl border border-charcoal/12 bg-ink text-parchment p-5 sm:p-6">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass-bright">
            How the council will meet you
          </p>
          <p className="mt-3 font-display text-xl text-parchment leading-snug">
            {opener.openWith}
          </p>
          <p className="mt-3 font-body text-sm text-parchment/60 leading-relaxed">
            Proof they respect: {opener.proofAngle}
          </p>
          <p className="mt-2 font-body text-xs text-parchment/40">
            What wastes the hour: {opener.avoid}
          </p>
        </aside>

        <QuotePlate quote="Walk the path with discipline, and the path will rise to meet you." />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild variant="paper" size="lg">
            <a href={counselHref} target="_blank" rel="noreferrer">
              Request counsel · win the field
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/field-reports">Field Reports</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link to="/map">Campaign map</Link>
          </Button>
        </div>

        <StartOverControl variant="danger" />
      </div>
    </CampaignShell>
  );
}
