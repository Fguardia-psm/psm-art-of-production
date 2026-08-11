import type { Archetype } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Printer, Share2 } from "lucide-react";
import { track } from "@/lib/analytics";
import { printFieldSeal } from "@/lib/print-field-seal";

/**
 * Field Seal — premium printable one-pager (campaign commission).
 * Archetype is always the hero identity; personal name is secondary if present.
 */
export function FieldCard({
  arch,
  readinessScore,
  readinessLabel,
  nineFacesScore,
  agentName,
  weakestChapter,
  strongestChapter,
}: {
  arch: Archetype;
  readinessScore: number;
  readinessLabel: string;
  nineFacesScore: number;
  agentName?: string;
  weakestChapter?: string;
  strongestChapter?: string;
}) {
  const readinessPct = Math.max(0, Math.min(100, readinessScore));
  // Never show generic placeholders as the hero title
  const bearerRaw = agentName?.trim() ?? "";
  const bearer =
    bearerRaw &&
    !/^(producer|agent|user|test|n\/a|na)$/i.test(bearerRaw)
      ? bearerRaw
      : "";
  const weekTargets = [
    "Week 1 — set the mission on the calendar",
    "Week 2 — hit measure; adjust ground",
    "Week 3 — protect formation; no task-hopping",
    "Week 4 — review scores; request counsel if stuck",
  ];

  return (
    <section className="print-seal-root space-y-3 print:space-y-0">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
            Your Field Seal
          </p>
          <p className="mt-1 font-body text-sm text-charcoal-muted max-w-md">
            Print this for your desk, or share it before a call with a field
            leader. Mission, risk, and Monday move on one page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            type="button"
            variant="paper"
            size="lg"
            onClick={() => {
              track("field_seal_print", { archetype: arch.id });
              printFieldSeal(document.getElementById("field-card"));
            }}
          >
            <Printer className="size-4" />
            Print Field Seal
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={async () => {
              const text = [
                `Field Seal · The Art of Production`,
                arch.name,
                arch.epithet,
                `Readiness ${readinessScore}/100`,
                `Nine Faces ${nineFacesScore}/9`,
                `30-day plan: ${arch.forecast.mission30}`,
                `Monday: ${arch.mondayScript}`,
                `PSM counsel: https://www.psmbrokerage.com/contact`,
              ].join("\n");
              track("field_seal_share", { archetype: arch.id });
              try {
                if (navigator.share) {
                  await navigator.share({
                    title: `${arch.name} · Field Seal`,
                    text,
                  });
                } else {
                  printFieldSeal(document.getElementById("field-card"));
                }
              } catch {
                /* user cancelled share */
              }
            }}
          >
            <Share2 className="size-4" />
            Share seal
          </Button>
        </div>
      </div>

      <article
        id="field-card"
        className="field-card-sheet relative overflow-hidden rounded-2xl border border-brass/40 bg-[var(--color-parchment)] text-charcoal shadow-[var(--shadow-plate)] print:shadow-none print:rounded-none print:border-2 print:border-[var(--color-brass-dim)]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          aria-hidden
          style={{
            background: `
              radial-gradient(ellipse 120% 80% at 50% -20%, color-mix(in oklab, var(--color-brass) 14%, transparent), transparent 55%),
              radial-gradient(ellipse 60% 40% at 100% 100%, color-mix(in oklab, var(--color-ink) 6%, transparent), transparent 50%),
              linear-gradient(180deg, var(--color-parchment) 0%, var(--color-parchment-deep) 100%)
            `,
          }}
        />
        <span className="field-card-corner field-card-corner-tl" aria-hidden />
        <span className="field-card-corner field-card-corner-tr" aria-hidden />
        <span className="field-card-corner field-card-corner-bl" aria-hidden />
        <span className="field-card-corner field-card-corner-br" aria-hidden />

        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-brass/25 pb-5">
            <div className="min-w-0">
              <p className="font-ui text-[10px] uppercase tracking-[0.28em] text-brass">
                The Art of Production
              </p>
              <p className="mt-1 font-ui text-[10px] uppercase tracking-[0.2em] text-charcoal-soft">
                Field Seal · campaign commission · PSM Brokerage
              </p>
              {/* Archetype is always the hero */}
              <p className="mt-3 font-ui text-[10px] uppercase tracking-[0.2em] text-brass">
                Your archetype
              </p>
              <h2 className="mt-1 font-display text-3xl sm:text-[2.75rem] text-charcoal tracking-tight leading-[0.95]">
                {arch.name}
              </h2>
              <p className="mt-2 font-display text-base sm:text-lg italic text-brass-dim max-w-md">
                {arch.epithet}
              </p>
              {bearer ? (
                <p className="mt-3 font-ui text-xs text-charcoal-soft">
                  Bearer ·{" "}
                  <span className="font-medium text-charcoal">{bearer}</span>
                </p>
              ) : (
                <p className="mt-3 font-ui text-[10px] uppercase tracking-[0.16em] text-charcoal-soft">
                  Sealed for the bearer of this campaign
                </p>
              )}
            </div>

            <div
              className="field-card-seal shrink-0 flex size-[5.5rem] flex-col items-center justify-center rounded-full border-2 border-brass/50 bg-brass/10 text-center shadow-[inset_0_0_0_4px_color-mix(in_oklab,var(--color-parchment)_70%,transparent)]"
              aria-hidden
            >
              <span className="font-ui text-[8px] uppercase tracking-[0.2em] text-brass">
                Field
              </span>
              <span className="mt-0.5 font-display text-2xl tabular-nums text-charcoal leading-none">
                {readinessScore}
              </span>
              <span className="font-ui text-[8px] uppercase tracking-[0.14em] text-charcoal-soft">
                Seal
              </span>
            </div>
          </header>

          <div className="mt-5 grid gap-4 sm:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-brass">
                Campaign readiness
              </p>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-brass/25 bg-charcoal/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brass-dim via-brass to-brass-bright"
                  style={{ width: `${readinessPct}%` }}
                />
              </div>
              <p className="mt-2 font-body text-xs text-charcoal-muted leading-relaxed">
                {readinessLabel}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-brass/20 bg-parchment/80 px-3 py-2.5">
                <p className="font-ui text-[9px] uppercase tracking-[0.16em] text-brass">
                  Nine Faces
                </p>
                <p className="mt-1 font-display text-2xl tabular-nums text-charcoal leading-none">
                  {nineFacesScore}
                  <span className="text-sm text-charcoal-soft">/9</span>
                </p>
              </div>
              <div className="rounded-lg border border-brass/20 bg-parchment/80 px-3 py-2.5">
                <p className="font-ui text-[9px] uppercase tracking-[0.16em] text-brass">
                  Scorecard
                </p>
                <p className="mt-1 font-body text-[11px] text-charcoal leading-snug">
                  {strongestChapter ? (
                    <>
                      Strong: {strongestChapter}
                      <br />
                    </>
                  ) : null}
                  {weakestChapter ? (
                    <>Watch: {weakestChapter}</>
                  ) : (
                    "Campaign sealed"
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-brass/30 bg-gradient-to-br from-brass/12 to-transparent px-4 py-4 sm:px-5">
            <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
              30-day production plan
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="font-ui text-[9px] uppercase tracking-[0.14em] text-ember">
                  Watch this risk
                </p>
                <p className="mt-0.5 font-body text-sm text-charcoal leading-snug">
                  {arch.forecast.risk}
                </p>
              </div>
              <div>
                <p className="font-ui text-[9px] uppercase tracking-[0.14em] text-brass">
                  Breakthrough path
                </p>
                <p className="mt-0.5 font-body text-sm text-charcoal leading-snug">
                  {arch.forecast.breakthrough}
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-charcoal/10 bg-parchment/90 px-3 py-3">
              <p className="font-ui text-[9px] uppercase tracking-[0.14em] text-brass">
                30-day mission
              </p>
              <p className="mt-1 font-body text-sm font-medium text-charcoal leading-snug">
                {arch.forecast.mission30}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-body text-xs text-charcoal-muted">
                <span>
                  <span className="text-brass">Measure · </span>
                  {arch.forecast.measure}
                </span>
                <span>
                  <span className="text-brass">Target · </span>
                  {arch.forecast.target}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-charcoal/10 bg-parchment/70 px-3 py-3">
              <p className="font-ui text-[9px] uppercase tracking-[0.14em] text-brass">
                How you win
              </p>
              <ul className="mt-2 space-y-1.5">
                {arch.strengths.map((s) => (
                  <li
                    key={s}
                    className="flex gap-2 font-body text-xs text-charcoal leading-snug"
                  >
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-brass" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-charcoal/10 bg-parchment/70 px-3 py-3">
              <p className="font-ui text-[9px] uppercase tracking-[0.14em] text-brass">
                Blind spot
              </p>
              <p className="mt-2 font-body text-xs text-charcoal leading-relaxed">
                {arch.blindSpot}
              </p>
              <p className="mt-2 font-ui text-[9px] uppercase tracking-[0.14em] text-brass">
                Season focus
              </p>
              <p className="mt-1 font-body text-xs text-charcoal-muted leading-relaxed">
                {arch.seasonFocus}
              </p>
            </div>
            <div className="rounded-lg border border-brass/35 bg-brass/10 px-3 py-3">
              <p className="font-ui text-[9px] uppercase tracking-[0.14em] text-brass">
                Monday move
              </p>
              <p className="mt-2 font-body text-xs text-charcoal leading-relaxed font-medium">
                {arch.mondayScript}
              </p>
              <p className="mt-3 font-display text-sm italic text-charcoal-soft leading-snug">
                “{arch.seal}”
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-brass/40 bg-parchment/50 px-4 py-4 print-compact-hide">
            <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-brass">
              30-day check-in
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {weekTargets.map((w) => (
                <li
                  key={w}
                  className="flex items-start gap-2.5 font-body text-xs text-charcoal leading-snug"
                >
                  <span
                    className="mt-0.5 size-3.5 shrink-0 rounded border border-brass/50 bg-parchment"
                    aria-hidden
                  />
                  {w}
                </li>
              ))}
            </ul>
            <p className="mt-3 font-body text-[11px] text-charcoal-muted leading-relaxed">
              Hard appointment tip: before you pitch, decide who is in the chair
              (Overwhelmed, Skeptic, Loyalist, Bargain-Seeker…). Open the way
              that fits them — not a generic script.
            </p>
          </div>

          <footer className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-brass/20 pt-4">
            <div>
              <p className="font-ui text-[9px] uppercase tracking-[0.18em] text-charcoal-soft">
                For agent use only · not a consumer piece
              </p>
              <p className="mt-1 font-body text-[11px] text-charcoal-muted">
                Bring this seal to counsel · psmbrokerage.com/contact
              </p>
            </div>
            <p className="font-display text-xs italic text-brass-dim">
              Same book. Better ground. Cleaner systems.
            </p>
          </footer>
        </div>
      </article>
    </section>
  );
}
