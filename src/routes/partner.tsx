import { createFileRoute, Link } from "@tanstack/react-router";
import { CampaignShell, SectionKicker } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  PARTNER_PROOF,
  PARTNER_STORIES,
  PSM_PARTNER_URL,
  SUPPORT_MODEL,
  fieldLeaderUrl,
} from "@/lib/content";
import { useCampaignStore } from "@/lib/campaign-store";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/partner")({
  component: PartnerPage,
});

function PartnerPage() {
  const { provisionalArchetype, lead, unlocked, fieldReportsSeen } =
    useCampaignStore();
  const leaderHref = fieldLeaderUrl(
    provisionalArchetype,
    lead?.name?.split(" ")[0],
  );

  return (
    <CampaignShell tone="ink" className="text-parchment">
      <div className="animate-fade-up space-y-12 max-w-2xl">
        <div>
          <SectionKicker ink>PSM Brokerage</SectionKicker>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl text-parchment">
            Partner — after proof
          </h1>
          <p className="mt-4 font-body text-parchment/65 leading-relaxed">
            The campaign earned trust. Field Reports earned the seat at the
            table. This page is the handoff to a human conversation — not a
            hard close.
          </p>
          {unlocked && !fieldReportsSeen ? (
            <div className="mt-4 rounded-lg border border-brass/40 bg-brass/10 px-4 py-3">
              <p className="font-body text-sm text-parchment/80">
                Recommended: read{" "}
                <Link
                  to="/field-reports"
                  className="underline underline-offset-2 text-brass-bright"
                >
                  Field Reports
                </Link>{" "}
                first — three producers on operating leverage.
              </p>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {PARTNER_PROOF.map((p) => (
            <div
              key={p.stat}
              className="rounded-lg border border-parchment/10 bg-parchment/[0.04] px-4 py-4"
            >
              <p className="font-display text-3xl text-brass-bright">{p.stat}</p>
              <p className="mt-2 font-body text-xs text-parchment/55 leading-relaxed">
                {p.label}
              </p>
            </div>
          ))}
        </div>

        <div>
          <SectionKicker ink>How support actually works</SectionKicker>
          <ul className="mt-4 space-y-3">
            {SUPPORT_MODEL.map((p) => (
              <li
                key={p.t}
                className="rounded-lg border border-parchment/10 bg-parchment/[0.04] px-4 py-4"
              >
                <p className="font-display text-lg text-parchment">{p.t}</p>
                <p className="mt-1 font-body text-sm text-parchment/55 leading-relaxed">
                  {p.d}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <SectionKicker ink>From the field</SectionKicker>
          <ul className="mt-4 space-y-3">
            {PARTNER_STORIES.map((s) => (
              <li
                key={s.role}
                className="rounded-lg border border-parchment/10 px-4 py-4"
              >
                <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass-bright/80">
                  {s.role}
                </p>
                <p className="mt-2 font-display text-lg italic text-parchment/85 leading-snug">
                  “{s.line}”
                </p>
              </li>
            ))}
          </ul>
          {unlocked ? (
            <Button asChild variant="secondary" size="sm" className="mt-4">
              <Link to="/field-reports">Full Field Reports chapter</Link>
            </Button>
          ) : null}
        </div>

        <div className="rounded-xl border border-brass/30 bg-brass/10 px-5 py-6">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass-bright">
            The conversation
          </p>
          <h2 className="mt-2 font-display text-2xl text-parchment">
            Talk to a field leader
          </h2>
          <p className="mt-2 font-body text-sm text-parchment/60 leading-relaxed">
            Bring your archetype, NPN, and book stage. We map contracts,
            marketing fire, and infrastructure — not a generic pitch deck. Our
            job was to earn curiosity; the recruiter’s job is the close.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary" size="xl">
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
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="secondary" size="lg">
            <Link to="/">Back to the campaign</Link>
          </Button>
          {unlocked ? (
            <Button asChild variant="secondary" size="lg">
              <Link to="/dossier">Your dossier</Link>
            </Button>
          ) : null}
        </div>

        <p className="font-display text-xl italic text-parchment/45">
          “Walk the path with discipline, and the path will rise to meet you.”
        </p>
      </div>
    </CampaignShell>
  );
}
