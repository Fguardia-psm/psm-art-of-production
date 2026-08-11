import {
  createFileRoute,
  Link,
  Navigate,
  useNavigate,
} from "@tanstack/react-router";
import { CampaignShell, SectionKicker } from "@/components/shell";
import { CampaignGate } from "@/components/campaign-gate";
import { Button } from "@/components/ui/button";
import {
  ARCHETYPES,
  PSM_CONTACT_URL,
  type ArchetypeId,
} from "@/lib/content";
import { requiredProgress, useCampaignStore } from "@/lib/campaign-store";
import { computeReadiness } from "@/lib/readiness";
import { ArrowRight, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/unlock")({
  component: UnlockPage,
});

function UnlockPage() {
  return (
    <CampaignGate>
      <UnlockPageInner />
    </CampaignGate>
  );
}

function UnlockPageInner() {
  const navigate = useNavigate();
  const state = useCampaignStore();
  const progress = requiredProgress(state);
  const readiness = computeReadiness(state);

  if (!state.scoutComplete) return <Navigate to="/scout" />;
  if (!progress.readyForGate) return <Navigate to="/map" />;
  if (state.unlocked) return <Navigate to="/dossier" />;

  const archetype = (state.provisionalArchetype ??
    "cartographer") as ArchetypeId;
  const archPreview = ARCHETYPES[archetype];

  const contactHref = (() => {
    const u = new URL(PSM_CONTACT_URL);
    u.searchParams.set("utm_content", "campaign-kit-unlock");
    u.searchParams.set("archetype", archetype);
    u.searchParams.set("readiness", String(readiness.score));
    return u.toString();
  })();

  function claimKit() {
    state.claimKitLocal();
    navigate({ to: "/dossier" });
  }

  return (
    <CampaignShell>
      <div className="mx-auto max-w-lg animate-fade-up">
        <SectionKicker>Campaign kit</SectionKicker>
        <h1 className="mt-3 font-display text-3xl text-charcoal sm:text-4xl">
          Claim your campaign kit
        </h1>
        <p className="mt-3 font-body text-charcoal-muted leading-relaxed">
          Your seals and Nine Faces are ready. In-app NPN lead capture is paused
          until our CRM connection is live next week — so we do not ask for
          credentials we cannot route yet.
        </p>

        {archPreview ? (
          <div className="mt-6 rounded-xl border border-brass/30 bg-brass/8 px-4 py-3">
            <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass">
              Provisional reading
            </p>
            <p className="mt-1 font-display text-xl text-charcoal">
              {archPreview.name}
            </p>
            <p className="font-body text-sm text-charcoal-muted">
              {archPreview.epithet}
            </p>
            <p className="mt-2 font-ui text-xs text-charcoal-soft tabular-nums">
              Campaign readiness {readiness.score}/100 · {readiness.label}
            </p>
          </div>
        ) : null}

        <div className="mt-8 space-y-4 rounded-xl border border-charcoal/10 bg-parchment/70 p-5 sm:p-6">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
            Want a field conversation?
          </p>
          <p className="font-body text-sm text-charcoal-muted leading-relaxed">
            Reach the PSM team on our Contact page. Mention{" "}
            <span className="font-medium text-charcoal">
              The Art of Production
            </span>
            {archPreview ? (
              <>
                {" "}
                and your reading:{" "}
                <span className="font-medium text-charcoal">
                  {archPreview.name}
                </span>
              </>
            ) : null}
            .
          </p>
          <Button asChild variant="paper" size="lg" className="w-full">
            <a href={contactHref} target="_blank" rel="noreferrer">
              Contact Us
              <ExternalLink className="size-4" />
            </a>
          </Button>
          <p className="text-center font-ui text-[11px] text-charcoal-soft">
            <a
              href="https://www.psmbrokerage.com/contact"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-charcoal"
            >
              www.psmbrokerage.com/contact
            </a>
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={claimKit}
          >
            Open dossier & face deck
            <ArrowRight className="size-4" />
          </Button>
          <p className="text-center font-body text-xs text-charcoal-soft leading-relaxed">
            Opens your kit on this device only — no NPN stored with us until
            lead capture returns.
          </p>
        </div>

        <p className="mt-8 text-center">
          <Link
            to="/map"
            className="font-ui text-xs text-charcoal-soft underline underline-offset-2"
          >
            Return to map
          </Link>
        </p>
      </div>
    </CampaignShell>
  );
}
