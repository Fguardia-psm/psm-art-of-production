import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  CampaignShell,
  QuotePlate,
  SectionKicker,
} from "@/components/shell";
import { CampaignGate } from "@/components/campaign-gate";
import { Button } from "@/components/ui/button";
import {
  ARCHETYPES,
  FIELD_REPORTS,
  FIELD_REPORTS_DISCLAIMER,
  RECRUITER_OPENERS,
  fieldLeaderUrl,
  type FieldReport,
} from "@/lib/content";
import { useCampaignStore } from "@/lib/campaign-store";
import { computeReadiness, chapterScorecard } from "@/lib/readiness";
import { cn } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/field-reports")({
  component: FieldReportsPage,
});

function FieldReportsPage() {
  return (
    <CampaignGate>
      <FieldReportsPageInner />
    </CampaignGate>
  );
}

function FieldReportsPageInner() {
  const state = useCampaignStore();
  const {
    unlocked,
    provisionalArchetype,
    lead,
    markFieldReportsSeen,
    fieldReportsSeen,
    nineFacesScore,
    chapterResults,
  } = state;
  const readiness = computeReadiness(state);
  const scorecard = chapterScorecard(chapterResults);

  const ranked = useMemo(() => {
    if (!provisionalArchetype) return FIELD_REPORTS;
    return [...FIELD_REPORTS].sort((a, b) => {
      const am = a.forArchetypes.includes(provisionalArchetype) ? 0 : 1;
      const bm = b.forArchetypes.includes(provisionalArchetype) ? 0 : 1;
      return am - bm;
    });
  }, [provisionalArchetype]);

  const [activeId, setActiveId] = useState(ranked[0]!.id);
  const [read, setRead] = useState<string[]>([]);

  useEffect(() => {
    setRead((prev) => (prev.includes(activeId) ? prev : [...prev, activeId]));
    markFieldReportsSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!unlocked) return <Navigate to="/unlock" />;

  const arch = provisionalArchetype
    ? ARCHETYPES[provisionalArchetype]
    : null;
  const opener = provisionalArchetype
    ? RECRUITER_OPENERS[provisionalArchetype]
    : null;
  const active =
    FIELD_REPORTS.find((r) => r.id === activeId) ?? FIELD_REPORTS[0]!;

  const allRead = read.length >= FIELD_REPORTS.length;
  const leaderHref = fieldLeaderUrl({
    archetype: provisionalArchetype,
    name: lead?.name?.split(" ")[0],
    readiness: readiness.score,
    readinessLabel: readiness.label,
    nineFacesScore,
    chaptersDone: scorecard.done,
    weakestChapter: scorecard.weakest,
    strongestChapter: scorecard.strongest,
    fieldReportsSeen: true,
    utmContent: "field-reports-counsel",
  });

  function markRead(id: string) {
    setRead((prev) => (prev.includes(id) ? prev : [...prev, id]));
    if (!fieldReportsSeen) markFieldReportsSeen();
  }

  function selectReport(r: FieldReport) {
    setActiveId(r.id);
    markRead(r.id);
  }

  return (
    <CampaignShell>
      <div className="space-y-10 animate-fade-up">
        <div>
          <SectionKicker>Proof · Field Reports</SectionKicker>
          <h1 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
            Field Reports
          </h1>
          <p className="mt-3 max-w-xl font-body text-charcoal-muted leading-relaxed">
            Not a brochure. Three composite patterns of producers who already
            had craft — and still needed operating leverage: time back, warmer
            ground, or structure that scales.
          </p>
          {arch ? (
            <p className="mt-3 font-ui text-xs uppercase tracking-[0.18em] text-brass">
              Ranked for {arch.name}
            </p>
          ) : null}
        </div>

        <QuotePlate
          quote="Changing FMOs is a major decision. Proof earns the conversation — the recruiter closes."
          sub="Your job here is curiosity with evidence, not a signature today."
        />

        <div className="flex flex-wrap gap-2">
          {ranked.map((r) => {
            const matched =
              provisionalArchetype &&
              r.forArchetypes.includes(provisionalArchetype);
            const isRead = read.includes(r.id);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => selectReport(r)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 font-ui text-xs transition-colors min-h-11",
                  activeId === r.id
                    ? "border-brass bg-brass text-ink"
                    : "border-charcoal/15 bg-parchment hover:border-brass/40",
                )}
              >
                {isRead ? (
                  <Check className="size-3.5" strokeWidth={2.5} />
                ) : null}
                <span>{r.agentName}</span>
                <span className="opacity-60">· {r.codename.replace("The ", "")}</span>
                {matched ? <span className="opacity-70">· match</span> : null}
              </button>
            );
          })}
        </div>

        <article className="rounded-xl border border-charcoal/10 bg-parchment/80 p-5 sm:p-7 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
                {active.codename}
              </p>
              <h2 className="mt-2 font-display text-3xl text-charcoal">
                {active.agentName}
              </h2>
              <p className="mt-1 font-body text-sm text-charcoal-soft">
                {active.region} · {active.yearsInField}
              </p>
              <p className="mt-1 font-body text-sm text-charcoal-muted">
                {active.role} · {active.stage}
              </p>
            </div>
            <span className="rounded-full border border-charcoal/15 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-charcoal-soft">
              Composite report
            </span>
          </div>

          <blockquote className="mt-6 border-l border-brass/40 pl-4">
            <p className="font-display text-lg italic text-charcoal leading-snug">
              “{active.quote}”
            </p>
          </blockquote>

          <div className="mt-6 space-y-5">
            <Block label="Pressure" body={active.pressure} />
            <Block label="Why they looked" body={active.switchReason} />
            <Block label="Leverage with PSM" body={active.leverage} />
            <Block label="Result" body={active.result} />
          </div>

          <div className="mt-6 rounded-lg border border-brass/25 bg-brass/8 px-4 py-4">
            <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass mb-3">
              Economics of the switch
            </p>
            <ul className="space-y-2">
              {active.economics.map((e) => (
                <li
                  key={e}
                  className="font-body text-sm text-charcoal leading-snug pl-3 border-l border-brass/40"
                >
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </article>

        <p className="font-body text-xs text-charcoal-soft leading-relaxed max-w-xl">
          {FIELD_REPORTS_DISCLAIMER}
        </p>

        {opener ? (
          <aside className="rounded-xl border border-charcoal/10 bg-ink text-parchment p-5 sm:p-6">
            <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass-bright">
              For the field leader who calls you
            </p>
            <p className="mt-3 font-display text-xl text-parchment leading-snug">
              {opener.openWith}
            </p>
            <p className="mt-3 font-body text-sm text-parchment/55 leading-relaxed">
              Proof angle: {opener.proofAngle}
            </p>
            <p className="mt-2 font-body text-xs text-parchment/40">
              Avoid: {opener.avoid}
            </p>
          </aside>
        ) : null}

        <section className="rounded-xl border border-brass/30 bg-brass/8 p-5 sm:p-6">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
            Earn the conversation
          </p>
          <h3 className="mt-2 font-display text-2xl text-charcoal">
            {allRead
              ? "Evidence reviewed. Request counsel · win the field."
              : "Review all three reports — then take the call."}
          </h3>
          <p className="mt-2 font-body text-sm text-charcoal-muted leading-relaxed max-w-xl">
            You have the proof. The next move is counsel — stand with a team
            that already wins seasons. This page is the evidence they will discuss with you.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild variant="paper" size="lg">
              <a href={leaderHref} target="_blank" rel="noreferrer">
                Request counsel · win the field
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/partner">Enter the war council</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/dossier">Back to dossier</Link>
            </Button>
          </div>
          <p className="mt-4 font-ui text-[11px] text-charcoal-soft tabular-nums">
            Reports reviewed: {Math.min(read.length, FIELD_REPORTS.length)}/
            {FIELD_REPORTS.length}
          </p>
        </section>
      </div>
    </CampaignShell>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-charcoal-soft">
        {label}
      </p>
      <p className="mt-1 font-body text-charcoal leading-relaxed">{body}</p>
    </div>
  );
}
