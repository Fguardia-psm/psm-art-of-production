import { track } from "@/lib/analytics";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AgentOnlyRibbon } from "@/components/shell";
import { StartOverControl } from "@/components/start-over";
import {
  hasCampaignProgress,
  useCampaignStore,
} from "@/lib/campaign-store";
import { useHydrated } from "@/lib/use-hydrated";
import { PSM_CONTACT_URL } from "@/lib/content";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const hydrated = useHydrated();
  const state = useCampaignStore();
  const {
    scoutComplete,
    unlocked,
    completedChapters,
    nineFacesComplete,
    fieldReportsSeen,
  } = state;

  const resumeTo = !hydrated
    ? "/scout"
    : unlocked
      ? fieldReportsSeen
        ? "/dossier"
        : "/field-reports"
      : nineFacesComplete
        ? "/unlock"
        : scoutComplete
          ? completedChapters.length >= 5
            ? "/nine-faces"
            : "/map"
          : "/scout";

  const inProgress = hydrated && hasCampaignProgress(state);

  const ctaLabel =
    hydrated && unlocked
      ? fieldReportsSeen
        ? "Open your dossier"
        : "Continue to Field Reports"
      : hydrated && scoutComplete
        ? "Resume the Campaign"
        : "Begin the Campaign";

  return (
    <div className="min-h-dvh ink-wash text-parchment flex flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-3">
          <p className="font-ui text-[11px] uppercase tracking-[0.28em] text-brass-bright/90">
            PSM Brokerage presents
          </p>
          <div className="flex items-center gap-4">
            {inProgress ? (
              <StartOverControl
                variant="header"
                className="text-parchment/45 hover:text-parchment/80"
              />
            ) : null}
            <a
              href={PSM_CONTACT_URL}
              target="_blank"
              rel="noreferrer"
              className="font-ui text-[11px] uppercase tracking-[0.18em] text-parchment/50 hover:text-parchment/80 transition-colors"
            >
              Request counsel
            </a>
          </div>
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
            About 30 minutes. Five strategic campaigns. Nine client types.
            One personal producer dossier with a production forecast. Built to
            make you better at the table — not to pitch you a deck.
          </p>

          <blockquote className="mt-10 border-l border-brass/50 pl-5 animate-fade-up">
            <p className="font-display text-xl text-parchment/90 italic sm:text-2xl">
              “Production is not luck. It is preparation made visible.”
            </p>
          </blockquote>

          {inProgress ? (
            <p className="mt-6 font-ui text-xs text-brass-bright/80 tracking-wide">
              Your campaign is saved on this device. Resume your dossier or
              start over anytime.
            </p>
          ) : null}

          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild variant="primary" size="xl" className="min-w-[200px]">
              <Link
                to={resumeTo}
                onClick={() =>
                  track(inProgress ? "map_view" : "campaign_start", {
                    resume: inProgress,
                  })
                }
              >
                {ctaLabel}
                <ArrowRight className="size-4" strokeWidth={2} />
              </Link>
            </Button>
            {inProgress ? (
              <Button asChild variant="secondary" size="lg">
                <a href={PSM_CONTACT_URL} target="_blank" rel="noreferrer">
                  Request counsel
                </a>
              </Button>
            ) : (
              <Button asChild variant="secondary" size="lg">
                <a href={PSM_CONTACT_URL} target="_blank" rel="noreferrer">
                  Already know you want counsel?
                </a>
              </Button>
            )}
          </div>
          {inProgress ? (
            <div className="mt-4">
              <StartOverControl
                variant="header"
                className="text-parchment/40 hover:text-parchment/70"
              />
            </div>
          ) : null}

          <ul className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              {
                k: "01",
                t: "Get your reading",
                d: "Six questions. How you win — and where production leaks.",
              },
              {
                k: "02",
                t: "Practice five campaigns",
                d: "Prep, no-pressure close, pipeline ground, day order, fire.",
              },
              {
                k: "03",
                t: "Proof, then counsel",
                d: "Field Reports show leverage. Then talk to a human.",
              },
            ].map((item) => (
              <li
                key={item.k}
                className="rounded-lg border border-parchment/10 bg-parchment/5 px-4 py-4"
              >
                <p className="font-ui text-[10px] tracking-[0.22em] text-brass-bright/80">
                  {item.k}
                </p>
                <p className="mt-2 font-display text-lg text-parchment">
                  {item.t}
                </p>
                <p className="mt-1 font-body text-sm text-parchment/55 leading-snug">
                  {item.d}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-parchment/10 pt-6 pb-2">
          <AgentOnlyRibbon className="text-parchment/35" />
        </div>
      </div>
    </div>
  );
}
