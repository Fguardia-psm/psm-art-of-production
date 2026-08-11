import type { Archetype } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

/**
 * Producer's Field Card — unexpected reward after completion.
 * Print via browser (no clipboard). Recruiter can print from shared session too.
 */
export function FieldCard({
  arch,
  readinessScore,
  readinessLabel,
  nineFacesScore,
  agentName,
}: {
  arch: Archetype;
  readinessScore: number;
  readinessLabel: string;
  nineFacesScore: number;
  agentName?: string;
}) {
  return (
    <section
      id="field-card"
      className="rounded-xl border border-charcoal/12 bg-parchment p-5 sm:p-6 shadow-[var(--shadow-card)] print:shadow-none print:border print:border-charcoal"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
            Reward · Producer's Field Card
          </p>
          <h2 className="mt-2 font-display text-2xl text-charcoal">
            {agentName ? `${agentName} · ` : ""}
            {arch.name}
          </h2>
          <p className="mt-1 font-display text-sm italic text-charcoal-muted">
            {arch.epithet}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="print:hidden"
          onClick={() => window.print()}
        >
          <Printer className="size-3.5" />
          Print field card
        </Button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-brass">
            Readiness
          </p>
          <p className="mt-1 font-display text-3xl tabular-nums text-charcoal">
            {readinessScore}
            <span className="text-base text-charcoal-soft">/100</span>
          </p>
          <p className="mt-1 font-body text-xs text-charcoal-muted">
            {readinessLabel}
          </p>
          <p className="mt-2 font-ui text-xs text-charcoal-soft tabular-nums">
            Nine Faces {nineFacesScore}/9
          </p>
        </div>
        <div>
          <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-brass">
            30-day mission
          </p>
          <p className="mt-1 font-body text-sm text-charcoal leading-relaxed">
            {arch.forecast.mission30}
          </p>
          <p className="mt-2 font-body text-xs text-charcoal-muted">
            Target: {arch.forecast.target}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-charcoal/10 bg-parchment/80 px-3 py-3">
          <p className="font-ui text-[10px] uppercase tracking-[0.14em] text-brass">
            Strengths
          </p>
          <ul className="mt-2 space-y-1">
            {arch.strengths.map((s) => (
              <li key={s} className="font-body text-xs text-charcoal leading-snug">
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-charcoal/10 bg-parchment/80 px-3 py-3">
          <p className="font-ui text-[10px] uppercase tracking-[0.14em] text-brass">
            Blind spot · season focus
          </p>
          <p className="mt-2 font-body text-xs text-charcoal leading-relaxed">
            {arch.blindSpot}
          </p>
          <p className="mt-2 font-body text-xs text-charcoal-muted leading-relaxed">
            {arch.seasonFocus}
          </p>
        </div>
      </div>

      <p className="mt-5 font-display text-sm italic text-charcoal-soft">
        “{arch.seal}”
      </p>
      <p className="mt-2 font-ui text-[10px] uppercase tracking-[0.18em] text-charcoal-soft">
        The Art of Production · PSM Brokerage · For agent use only
      </p>
    </section>
  );
}
