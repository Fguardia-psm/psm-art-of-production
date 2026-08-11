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
  RECRUITER_OPENERS,
  fieldLeaderUrl,
  resultLabel,
} from "@/lib/content";
import { useCampaignStore } from "@/lib/campaign-store";
import { computeReadiness } from "@/lib/readiness";
import { ArrowRight, Copy, Download, Share2, Users } from "lucide-react";

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
    chapterResults,
    leaderCode,
    ensureLeaderCode,
    fieldReportsSeen,
  } = state;

  if (!unlocked || !provisionalArchetype) {
    return <Navigate to="/unlock" />;
  }

  const arch = ARCHETYPES[provisionalArchetype];
  const opener = RECRUITER_OPENERS[provisionalArchetype];
  const code = leaderCode ?? ensureLeaderCode();
  fieldLeaderUrl(provisionalArchetype, lead?.name?.split(" ")[0]);
  const readiness = computeReadiness(state);

  const scorecard = Object.entries(chapterResults)
    .map(([slug, r]) => `${slug}: ${resultLabel(r)}`)
    .join("\n");

  async function shareBanner() {
    const text = `${arch.name} — ${arch.epithet}\n“${arch.seal}”\nNine Faces: ${nineFacesScore}/9\nReadiness: ${readiness.score}/100\nThe Art of Production · PSM Brokerage`;
    try {
      if (navigator.share) {
        await navigator.share({ title: arch.name, text });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Banner text copied.");
      }
    } catch {
      /* cancelled */
    }
  }

  async function copyLeader() {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/?ref=${code}`;
    const text = `Walk The Art of Production with me.\nLeader code: ${code}\n${link}`;
    try {
      await navigator.clipboard.writeText(text);
      alert("Downline invite copied.");
    } catch {
      alert(text);
    }
  }

  async function copyRecruiterBrief() {
    const text = [
      `RECRUITER BRIEF — The Art of Production`,
      `Agent: ${lead?.name ?? ""}`,
      `NPN: ${lead?.npn ?? ""} · ${lead?.state ?? ""}`,
      `Stage: ${lead?.bookStage ?? ""}`,
      `Archetype: ${arch.name}`,
      `Readiness: ${readiness.score}/100 — ${readiness.label}`,
      ``,
      `Open with: ${opener.openWith}`,
      `Proof angle: ${opener.proofAngle}`,
      `Avoid: ${opener.avoid}`,
      ``,
      `Nine Faces: ${nineFacesScore}/9`,
      `Field reports: ${fieldReportsSeen ? "reviewed" : "pending"}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      alert("Recruiter brief copied.");
    } catch {
      alert(text);
    }
  }

  function downloadScripts() {
    const lines = [
      `THE ART OF PRODUCTION — Nine Faces Loot Deck + Script Pack`,
      `Agent: ${lead?.name ?? ""}`,
      `Archetype: ${arch.name}`,
      `Nine Faces: ${nineFacesScore}/9`,
      `Campaign readiness: ${readiness.score}/100`,
      ``,
      `MONDAY MOVE`,
      arch.mondayScript,
      ``,
      `RECRUITER OPEN`,
      opener.openWith,
      opener.proofAngle,
      ``,
      `NINE FACES — LOOT DECK (opening lines)`,
      ...CLIENT_FACES.flatMap((f) => [
        ``,
        `══ ${f.name} ══`,
        `Cue: ${f.cue}`,
        `Approach: ${f.approach}`,
        `Open: ${f.openingLine}`,
        `Note: ${f.fieldNote}`,
      ]),
      ``,
      `CHAPTER SCORECARD`,
      scorecard,
      ``,
      `For Agent Use Only · PSM Brokerage · High-protein residue from the campaign`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "art-of-production-face-deck.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <CampaignShell>
      <div className="space-y-10 animate-fade-up">
        <div>
          <SectionKicker>Your campaign kit</SectionKicker>
          <h1 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
            {lead?.name
              ? `${lead.name.split(" ")[0]}, your dossier`
              : "Your dossier"}
          </h1>
          <p className="mt-2 font-body text-charcoal-muted">
            Seals pressed. Face deck unlocked. Manual ready. Proof next.
          </p>
        </div>

        <ReadinessPlate
          score={readiness.score}
          label={readiness.label}
          parts={readiness.parts}
        />

        <section className="rounded-xl border border-brass/35 bg-brass/10 p-5 sm:p-6">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
            Post-kit path · cooperate over extract
          </p>
          <ol className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 font-ui text-xs text-charcoal-muted">
            <li className="text-brass font-medium">1. Dossier + loot</li>
            <li className="hidden sm:inline opacity-40">→</li>
            <li
              className={
                fieldReportsSeen ? "text-brass font-medium" : "text-charcoal"
              }
            >
              2. Field Reports
            </li>
            <li className="hidden sm:inline opacity-40">→</li>
            <li>3. Field leader</li>
          </ol>
          <h2 className="mt-4 font-display text-2xl text-charcoal">
            {fieldReportsSeen
              ? "Proof reviewed — take the conversation"
              : "Take your loot, then read the Field Reports"}
          </h2>
          <p className="mt-2 font-body text-sm text-charcoal-muted leading-relaxed max-w-xl">
            High-protein path: face deck for Monday, Field Reports for the
            economics of a switch, then a human who already has your brief.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="paper" size="lg">
              <Link to="/field-reports">
                {fieldReportsSeen ? "Revisit Field Reports" : "Open Field Reports"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={downloadScripts}>
              <Download className="size-4" />
              Download face deck
            </Button>
          </div>
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
            Blind spot (we do not flatter)
          </p>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-parchment/55">
            {arch.blindSpot}
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-charcoal/10 bg-parchment/70 p-5">
            <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
              Strengths
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
              Nine Faces · loot
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
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
            Face deck · high-protein residue
          </p>
          <p className="mt-2 font-body text-sm text-charcoal-muted">
            Cards earned from the master scene. Not vanity XP — lines you can
            use at the table Monday.
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
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="mt-4"
            onClick={downloadScripts}
          >
            <Download className="size-4" />
            Download full face deck
          </Button>
        </section>

        <aside className="rounded-xl border border-charcoal/12 bg-ink text-parchment p-5 sm:p-6">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass-bright">
            Recruiter brief · auto-filed on NPN
          </p>
          <p className="mt-3 font-display text-xl text-parchment leading-snug">
            {opener.openWith}
          </p>
          <p className="mt-3 font-body text-sm text-parchment/60 leading-relaxed">
            Proof angle: {opener.proofAngle}
          </p>
          <p className="mt-2 font-body text-xs text-parchment/40">
            Avoid: {opener.avoid}
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={copyRecruiterBrief}
          >
            <Copy className="size-3.5" />
            Copy recruiter brief
          </Button>
        </aside>

        <aside className="rounded-xl border border-brass/30 bg-brass/8 p-5 sm:p-6">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
            Sealed reward · the manual (canon)
          </p>
          <p className="mt-2 font-body text-charcoal leading-relaxed">
            This campaign complements the article — it does not replace it. The
            PDF remains the high-protein primary source. Walk the path; own the
            manual.
          </p>
          <p className="mt-4 font-display text-lg italic text-charcoal">
            “{arch.seal}”
          </p>
          <Button asChild variant="paper" size="lg" className="mt-4">
            <a href={PDF_URL} target="_blank" rel="noreferrer">
              <Download className="size-4" />
              Download the manual
            </a>
          </Button>
        </aside>

        <section className="rounded-xl border border-charcoal/10 bg-parchment/70 p-5">
          <div className="flex items-start gap-3">
            <Users className="size-5 text-brass shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
                Leader mode · downline invite
              </p>
              <p className="mt-2 font-body text-sm text-charcoal-muted leading-relaxed">
                Assign this campaign before AEP. Same seals. Same face deck.
              </p>
              <p className="mt-3 font-display text-2xl tracking-widest text-charcoal">
                {code}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={copyLeader}
              >
                <Copy className="size-3.5" />
                Copy invite
              </Button>
            </div>
          </div>
        </section>

        <QuotePlate quote="Walk the path with discipline, and the path will rise to meet you." />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild variant="paper" size="lg">
            <Link to="/field-reports">
              Field Reports
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={shareBanner}>
            <Share2 className="size-4" />
            Share your banner
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
