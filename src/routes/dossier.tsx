import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  CampaignShell,
  QuotePlate,
  SectionKicker,
} from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  ARCHETYPES,
  CLIENT_FACES,
  PDF_URL,
  PSM_PARTNER_URL,
  fieldLeaderUrl,
  resultLabel,
} from "@/lib/content";
import { useCampaignStore } from "@/lib/campaign-store";
import { ArrowRight, Copy, Download, Share2, Users } from "lucide-react";

export const Route = createFileRoute("/dossier")({
  component: DossierPage,
});

function DossierPage() {
  const {
    unlocked,
    provisionalArchetype,
    lead,
    nineFacesScore,
    chapterResults,
    leaderCode,
    ensureLeaderCode,
    resetCampaign,
  } = useCampaignStore();

  if (!unlocked || !provisionalArchetype) {
    return <Navigate to="/unlock" />;
  }

  const arch = ARCHETYPES[provisionalArchetype];
  const code = leaderCode ?? ensureLeaderCode();
  const leaderHref = fieldLeaderUrl(
    provisionalArchetype,
    lead?.name?.split(" ")[0],
  );

  const scorecard = Object.entries(chapterResults)
    .map(([slug, r]) => `${slug}: ${resultLabel(r)}`)
    .join("\n");

  async function shareBanner() {
    const text = `${arch.name} — ${arch.epithet}\n“${arch.seal}”\nNine Faces: ${nineFacesScore}/9\nThe Art of Production · PSM Brokerage`;
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

  function downloadScripts() {
    const lines = [
      `THE ART OF PRODUCTION — Script Pack`,
      `Agent: ${lead?.name ?? ""}`,
      `Archetype: ${arch.name}`,
      `Nine Faces: ${nineFacesScore}/9`,
      ``,
      `MONDAY MOVE`,
      arch.mondayScript,
      ``,
      `NINE FACES — OPENING LINES`,
      ...CLIENT_FACES.flatMap((f) => [
        ``,
        `${f.name}`,
        `Cue: ${f.cue}`,
        `Open: ${f.openingLine}`,
        `Note: ${f.fieldNote}`,
      ]),
      ``,
      `CHAPTER SCORECARD`,
      scorecard,
      ``,
      `For Agent Use Only · PSM Brokerage`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "art-of-production-script-pack.txt";
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
            Sealed after the campaign. Your scorecard, scripts, and path to PSM.
          </p>
        </div>

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
              Blind spot
            </p>
            <p className="mt-3 font-body text-sm text-charcoal leading-relaxed">
              {arch.blindSpot}
            </p>
            <p className="mt-4 font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
              Nine Faces
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

        <aside className="rounded-xl border border-brass/30 bg-brass/8 p-5 sm:p-6">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
            Next campaign move with PSM
          </p>
          <p className="mt-2 font-body text-charcoal leading-relaxed">
            {arch.psmMove}
          </p>
          <p className="mt-4 font-display text-lg italic text-charcoal">
            “{arch.seal}”
          </p>
        </aside>

        <section className="rounded-xl border border-charcoal/10 bg-parchment/70 p-5 sm:p-6">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
            Script pack · Nine Faces
          </p>
          <p className="mt-2 font-body text-sm text-charcoal-muted">
            Opening lines you can use Monday. Download the full pack for your
            desk.
          </p>
          <ul className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-1">
            {CLIENT_FACES.slice(0, 4).map((f) => (
              <li key={f.id} className="border-t border-charcoal/8 pt-3">
                <p className="font-ui text-xs font-medium text-charcoal">
                  {f.name}
                </p>
                <p className="mt-1 font-display text-sm italic text-charcoal">
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
            Download full script pack
          </Button>
        </section>

        <section className="rounded-xl border border-charcoal/12 bg-ink text-parchment p-6 sm:p-8">
          <h3 className="font-display text-2xl">
            Join the ranks that prepare wisely
          </h3>
          <p className="mt-3 font-body text-parchment/65 leading-relaxed max-w-xl">
            Talk to a field leader with your archetype preloaded — or start your
            partner journey with PSM’s mentorship, marketing, tech, and
            compliance-first support.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild variant="primary" size="lg">
              <a href={leaderHref} target="_blank" rel="noreferrer">
                Talk to a field leader
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={PSM_PARTNER_URL} target="_blank" rel="noreferrer">
                Partner with PSM
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/partner">Why agents join</Link>
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-charcoal/10 bg-parchment/70 p-5">
          <div className="flex items-start gap-3">
            <Users className="size-5 text-brass shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
                Leader mode · downline invite
              </p>
              <p className="mt-2 font-body text-sm text-charcoal-muted leading-relaxed">
                Assign this campaign to your team. Share your leader code so they
                walk the same path before AEP.
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
          <Button asChild variant="outline" size="lg">
            <a href={PDF_URL} target="_blank" rel="noreferrer">
              <Download className="size-4" />
              Download the manual
            </a>
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={shareBanner}>
            <Share2 className="size-4" />
            Share your banner
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link to="/map">Revisit campaign map</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm("Reset campaign progress on this device?")) {
              resetCampaign();
              window.location.href = "/";
            }
          }}
          className="font-ui text-xs text-charcoal-soft underline underline-offset-2"
        >
          Reset campaign
        </button>
      </div>
    </CampaignShell>
  );
}
