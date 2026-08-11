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
import { ArrowRight } from "lucide-react";

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

  const counselHref = (() => {
    const u = new URL(PSM_CONTACT_URL);
    u.searchParams.set("utm_content", "seal-the-campaign");
    u.searchParams.set("archetype", archetype);
    u.searchParams.set("readiness", String(readiness.score));
    return u.toString();
  })();

  function enterDossier() {
    state.claimKitLocal();
    navigate({ to: "/dossier" });
  }

  return (
    <CampaignShell>
      <div className="mx-auto max-w-lg animate-fade-up">
        <SectionKicker>The seal</SectionKicker>
        <h1 className="mt-3 font-display text-3xl text-charcoal sm:text-4xl">
          Victory without alliance is temporary
        </h1>
        <p className="mt-3 font-body text-charcoal-muted leading-relaxed">
          You have marched the campaign. The last move is not a form — it is
          whether you stand alone next season, or with a council that already
          knows how seasons are won.
        </p>

        {archPreview ? (
          <div className="mt-6 rounded-xl border border-brass/30 bg-brass/8 px-4 py-4">
            <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass">
              Your field reading
            </p>
            <p className="mt-1 font-display text-2xl text-charcoal">
              {archPreview.name}
            </p>
            <p className="font-body text-sm text-charcoal-muted">
              {archPreview.epithet}
            </p>
            <p className="mt-3 font-ui text-xs text-charcoal-soft tabular-nums">
              Readiness {readiness.score}/100 · {readiness.label}
            </p>
          </div>
        ) : null}

        <div className="mt-8 space-y-3">
          <Button
            type="button"
            variant="paper"
            size="xl"
            className="w-full"
            onClick={enterDossier}
          >
            Enter your field dossier
            <ArrowRight className="size-4" />
          </Button>
          <p className="text-center font-body text-xs text-charcoal-soft leading-relaxed">
            Archetype, Monday move, Nine Faces, and the path to the council —
            sealed on this device.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-charcoal/10 bg-ink px-5 py-6 text-parchment">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass-bright">
            Those who win AEP do not improvise alone
          </p>
          <p className="mt-3 font-display text-xl leading-snug">
            Request counsel. Bring your reading. Ask how to win the ground
            before the enrollment storm.
          </p>
          <Button asChild variant="primary" size="lg" className="mt-5 w-full">
            <a href={counselHref} target="_blank" rel="noreferrer">
              Request counsel · win the field
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>

        <p className="mt-8 text-center">
          <Link
            to="/map"
            className="font-ui text-xs text-charcoal-soft underline underline-offset-2"
          >
            Return to the campaign map
          </Link>
        </p>
      </div>
    </CampaignShell>
  );
}
