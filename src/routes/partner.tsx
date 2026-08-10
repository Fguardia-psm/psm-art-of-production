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
  const { provisionalArchetype, lead } = useCampaignStore();
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
            Why top producers partner here
          </h1>
          <p className="mt-4 font-body text-parchment/65 leading-relaxed">
            The principles in The Art of Production are timeless. The structure
            to live them — carriers, marketing, technology, compliance, and a
            human field path — is what an FMO must provide. That is the banner
            PSM raises.
          </p>
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
        </div>

        <div className="rounded-xl border border-brass/30 bg-brass/10 px-5 py-6">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass-bright">
            Next step
          </p>
          <h2 className="mt-2 font-display text-2xl text-parchment">
            Talk to a field leader
          </h2>
          <p className="mt-2 font-body text-sm text-parchment/60 leading-relaxed">
            Bring your archetype, NPN, and book stage. We will map contracts,
            marketing fire, and infrastructure — not a generic pitch deck.
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
          <Button asChild variant="secondary" size="lg">
            <Link to="/dossier">Your dossier</Link>
          </Button>
        </div>

        <p className="font-display text-xl italic text-parchment/45">
          “Walk the path with discipline, and the path will rise to meet you.”
        </p>
      </div>
    </CampaignShell>
  );
}
