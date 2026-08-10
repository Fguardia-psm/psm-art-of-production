import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AgentOnlyRibbon } from "@/components/shell";
import { useCampaignStore } from "@/lib/campaign-store";
import { useHydrated } from "@/lib/use-hydrated";
import { PSM_PARTNER_URL } from "@/lib/content";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const hydrated = useHydrated();
  const { scoutComplete, unlocked, completedChapters, nineFacesComplete } =
    useCampaignStore();

  const resumeTo =
    !hydrated
      ? "/scout"
      : unlocked
        ? "/dossier"
        : nineFacesComplete
          ? "/unlock"
          : scoutComplete
            ? completedChapters.length >= 5
              ? "/nine-faces"
              : "/map"
            : "/scout";

  const ctaLabel =
    hydrated && scoutComplete ? "Resume the Campaign" : "Begin the Campaign";

  return (
    <div className="min-h-dvh ink-wash text-parchment flex flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-3">
          <p className="font-ui text-[11px] uppercase tracking-[0.28em] text-brass-bright/90">
            PSM Brokerage presents
          </p>
          <a
            href={PSM_PARTNER_URL}
            target="_blank"
            rel="noreferrer"
            className="font-ui text-[11px] uppercase tracking-[0.18em] text-parchment/50 hover:text-parchment/80 transition-colors"
          >
            Partner with PSM
          </a>
        </div>

        <div className="flex flex-1 flex-col justify-center py-12 sm:py-16">
          <p className="font-display text-sm title-spaced text-parchment/50 animate-fade-up">
            A Strategic Manual for Insurance Agents
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.75rem,8vw,4.5rem)] leading-[0.95] tracking-tight text-parchment animate-ink-in">
            The Art of
            <br />
            Production
          </h1>
          <p
            className="mt-8 max-w-xl font-body text-lg text-parchment/70 leading-relaxed animate-fade-up"
            style={{ ["--motion" as string]: "500ms" }}
          >
            Insurance is a business of strategy, not chance. Walk an interactive
            campaign drawn from the manual — discover your producer archetype,
            master the seasons, and claim your place among those who prepare
            wisely.
          </p>

          <blockquote className="mt-10 border-l border-brass/50 pl-5 animate-fade-up">
            <p className="font-display text-xl text-parchment/90 italic sm:text-2xl">
              “To know your production, know your preparation.”
            </p>
          </blockquote>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild variant="primary" size="xl" className="min-w-[200px]">
              <Link to={resumeTo}>
                {ctaLabel}
                <ArrowRight className="size-4" strokeWidth={2} />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={PSM_PARTNER_URL} target="_blank" rel="noreferrer">
                Partner with PSM
              </a>
            </Button>
          </div>

          <ul className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              {
                k: "01",
                t: "Scout your archetype",
                d: "Six questions. One identity that names how you win.",
              },
              {
                k: "02",
                t: "Walk five campaigns",
                d: "Preparation, stratagem, ground, energy, and fire.",
              },
              {
                k: "03",
                t: "Claim the kit",
                d: "Unlock your dossier, the manual, and join PSM.",
              },
            ].map((item) => (
              <li
                key={item.k}
                className="rounded-lg border border-parchment/10 bg-parchment/[0.03] px-4 py-4"
              >
                <p className="font-ui text-[10px] tracking-[0.24em] text-brass-bright/80">
                  {item.k}
                </p>
                <p className="mt-2 font-display text-lg text-parchment">
                  {item.t}
                </p>
                <p className="mt-1 font-body text-sm text-parchment/55 leading-relaxed">
                  {item.d}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <AgentOnlyRibbon className="text-parchment/35" />
      </div>
    </div>
  );
}
