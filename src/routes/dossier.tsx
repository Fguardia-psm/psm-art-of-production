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
  CLIENT_FACES,
  PDF_URL,
  PSM_CONTACT_URL,
  RECRUITER_OPENERS,
  fieldLeaderUrl,
} from "@/lib/content";
import { useCampaignStore } from "@/lib/campaign-store";
import { computeReadiness } from "@/lib/readiness";
import { ArrowRight, BookOpen, Scroll } from "lucide-react";

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
  } = state;

  if (!unlocked || !provisionalArchetype) {
    return <Navigate to="/unlock" />;
  }

  const arch = ARCHETYPES[provisionalArchetype];
  const opener = RECRUITER_OPENERS[provisionalArchetype];
  const readiness = computeReadiness(state);
  const counselHref = fieldLeaderUrl(
    provisionalArchetype,
    lead?.name?.split(" ")[0],
  );

  return (
    <CampaignShell>
      <div className="space-y-10 animate-fade-up">
        <div>
          <SectionKicker>Field dossier · sealed</SectionKicker>
          <h1 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
            {lead?.name
              ? `${lead.name.split(" ")[0]}, the field is marked`
              : "The field is marked"}
          </h1>
          <p className="mt-2 font-body text-charcoal-muted leading-relaxed max-w-xl">
            You walked the path. Seals pressed. Nine faces known. What remains is
            not another checklist — it is who you stand with when the season
            opens.
          </p>
        </div>

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
            PSM is the council after the campaign: contracts, marketing fire,
            systems, and field leaders who have sealed seasons — not a pitch
            deck. Bring your reading (
            <span className="text-brass-bright/90">{arch.name}</span>
            ). Ask how to win the next AEP with formation behind you.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary" size="xl">
              <a href={counselHref} target="_blank" rel="noreferrer">
                Request counsel · win the field
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/field-reports">
                {fieldReportsSeen ? "Revisit Field Reports" : "Study Field Reports"}
              </Link>
            </Button>
          </div>
          <p className="mt-4 font-ui text-[11px] text-parchment/40">
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

        <section className="ink-wash rounded-xl border border-parchment/10 px-6 py-10 text-center shadow-[var(--shadow-plate)] sm:px-10">
          <p className="font-ui text-[11px] uppercase tracking-[0.28em] text-brass-bright/90">
            Producer archetype
          </p>
          <h2 className="mt-3 font-display text-4xl text-parchment sm:text-5xl">
            {arch.name}
          </h2>
          <p className="mt-3 font-display text-lg italic text-parchment/70">
            {arch.epithet}
          </p>
          <p className="mx-auto mt-6 max-w-lg font-body text-parchment/65 leading-relaxed">
            {arch.summary}
          </p>
          <p className="mt-4 font-ui text-[10px] uppercase tracking-[0.2em] text-parchment/40">
            Blind spot · we do not flatter
          </p>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-parchment/55">
            {arch.blindSpot}
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
              Nine Faces known
            </p>
            <p className="mt-2 font-display text-2xl text-charcoal tabular-nums">
              {nineFacesScore}/9
            </p>
            <p className="mt-4 font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
              Monday move
            </p>
            <p className="mt-2 font-body text-sm text-charcoal leading-relaxed">
              {arch.mondayScript}
            </p>
          </div>
        </div>

        <section className="rounded-xl border border-charcoal/10 bg-parchment/70 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Scroll className="size-4 text-brass" />
            <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
              The Nine Faces · know the enemy of confusion
            </p>
          </div>
          <p className="mt-2 font-body text-sm text-charcoal-muted">
            Nine client languages. Read them. Use them at the table — not as a
            script file, as doctrine.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {CLIENT_FACES.map((f) => (
              <li
                key={f.id}
                className="rounded-lg border border-charcoal/10 bg-parchment px-3 py-3"
              >
                <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-brass">
                  {f.name}
                </p>
                <p className="mt-1 font-display text-sm italic text-charcoal leading-snug">
                  {f.openingLine}
                </p>
              </li>
            ))}
          </ul>
        </section>

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
