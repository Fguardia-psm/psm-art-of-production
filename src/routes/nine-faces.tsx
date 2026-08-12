import { track } from "@/lib/analytics";
import { useMemo, useRef, useState } from "react";
import { useScrollToTopOnChange, scrollToTopOfCampaign } from "@/components/scroll-to-top";
import {
  createFileRoute,
  Link,
  Navigate,
  useNavigate,
} from "@tanstack/react-router";
import {
  CampaignShell,
  MarkWell,
  QuotePlate,
  SectionKicker,
} from "@/components/shell";
import { CampaignGate } from "@/components/campaign-gate";
import { Button } from "@/components/ui/button";
import { CLIENT_FACES, REQUIRED_CHAPTER_SLUGS, shuffleArray } from "@/lib/content";
import { useCampaignStore } from "@/lib/campaign-store";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/nine-faces")({
  component: NineFacesPage,
});

function NineFacesPage() {
  return (
    <CampaignGate>
      <NineFacesPageInner />
    </CampaignGate>
  );
}

function NineFacesPageInner() {
  const navigate = useNavigate();
  const {
    scoutComplete,
    completedChapters,
    completeNineFaces,
    nineFacesComplete,
    nineFacesScore,
    unlocked,
    claimKitLocal,
  } = useCampaignStore();

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [picked, setPicked] = useState<"right" | "wrong" | null>(null);
  const [finished, setFinished] = useState(nineFacesComplete);
  useScrollToTopOnChange(finished ? "faces-done" : `face-${index}`);

  const requiredDone = REQUIRED_CHAPTER_SLUGS.every((s) =>
    completedChapters.includes(s),
  );

  if (!scoutComplete) return <Navigate to="/scout" />;
  if (!requiredDone) return <Navigate to="/map" />;

  const face = CLIENT_FACES[index];
  const total = CLIENT_FACES.length;

  const options = useMemo(() => {
    if (!face) return [];
    return shuffleArray(
      [
        { kind: "wrong" as const, label: face.wrong },
        { kind: "right" as const, label: face.right },
      ],
      index * 17 + face.id.length * 3,
    );
  }, [face, index]);

  function choose(kind: "right" | "wrong") {
    if (picked || !face) return;
    setPicked(kind);
    if (kind === "right") {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }
  }

  function next() {
    scrollToTopOfCampaign();
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setPicked(null);
      return;
    }
    completeNineFaces(scoreRef.current);
    track("faces_complete", { score: scoreRef.current });
    setFinished(true);
  }

  function finishAndGo() {
    if (!nineFacesComplete) completeNineFaces(scoreRef.current);
    // Claim kit on this device so the full path (dossier → Field Reports) is clickable
    if (!unlocked) claimKitLocal();
    navigate({ to: "/dossier" });
  }

  if (finished || nineFacesComplete) {
    const displayScore = nineFacesComplete ? nineFacesScore : score;
    return (
      <CampaignShell>
        <div className="mx-auto max-w-xl text-center animate-fade-up">
          <SectionKicker>Master scene complete</SectionKicker>
          <h1 className="mt-3 font-display text-3xl text-charcoal sm:text-4xl">
            The Nine Faces
          </h1>
          <p className="mt-4 font-display text-5xl text-brass tabular-nums">
            {displayScore}
            <span className="text-2xl text-charcoal-soft"> / {total}</span>
          </p>
          <p className="mt-6 font-body text-charcoal-muted leading-relaxed">
            The agent who speaks one language wins one type of client. The agent
            who reads the person in the chair wins trust faster.
          </p>
          <div className="mt-6 text-left">
            <MarkWell>
              Adapt not your integrity, but your expression of it — for the
              message is one, but the path to understanding is many.
            </MarkWell>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="paper" size="lg" onClick={finishAndGo}>
              "Enter your field dossier"
              <ArrowRight className="size-4" />
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/map">Campaign map</Link>
            </Button>
          </div>
        </div>
      </CampaignShell>
    );
  }

  if (!face) return null;

  return (
    <CampaignShell>
      <div className="animate-fade-up space-y-8">
        <div>
          <SectionKicker>
            Master scene · {index + 1} of {total}
          </SectionKicker>
          <h1 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
            The Nine Faces
          </h1>
          <p className="mt-2 font-body text-charcoal-muted">
            Each client arrives with a different mind and heart. Choose the
            approach that forges trust.
          </p>
        </div>

        <QuotePlate
          quote="Each client type demands its own approach."
          sub="The agent who reads the person in the chair wins trust faster."
        />

        <section className="rounded-xl border border-charcoal/10 bg-parchment/80 p-5 sm:p-6 shadow-[var(--shadow-card)]">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
            Client before you
          </p>
          <h2 className="mt-2 font-display text-2xl text-charcoal">
            {face.name}
          </h2>
          <p className="mt-2 font-body text-charcoal-muted italic">{face.cue}</p>
          <p className="mt-4 font-ui text-xs uppercase tracking-[0.18em] text-charcoal-soft">
            Teaching
          </p>
          <p className="mt-1 font-body text-charcoal">{face.approach}</p>

          <div className="mt-6 grid gap-2">
            {options.map((opt) => (
              <button
                key={opt.kind}
                type="button"
                disabled={!!picked}
                onClick={() => choose(opt.kind)}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left font-ui text-sm transition-colors min-h-11",
                  picked === opt.kind
                    ? opt.kind === "right"
                      ? "border-success/40 bg-success/10"
                      : "border-ember/40 bg-ember/10"
                    : "border-charcoal/12 hover:border-brass/40",
                  picked && picked !== opt.kind && "opacity-45",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {picked ? (
            <div className="mt-5 animate-fade-up space-y-3">
              <div className="rounded-lg border border-brass/25 bg-brass/8 px-4 py-3">
                <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass mb-1">
                  {picked === "right" ? "Connection forged" : "Trust frayed"}
                </p>
                <p className="font-body text-sm text-charcoal">
                  {picked === "right" ? face.right : `Better path: ${face.right}`}
                </p>
              </div>
              <div className="rounded-lg border border-charcoal/10 bg-parchment px-4 py-3">
                <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-charcoal-soft mb-1">
                  Opening line
                </p>
                <p className="font-display text-base italic text-charcoal">
                  {face.openingLine}
                </p>
                <p className="mt-2 font-body text-xs text-charcoal-muted">
                  {face.fieldNote}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        <div className="flex justify-end">
          <Button variant="paper" size="lg" disabled={!picked} onClick={next}>
            {index < total - 1 ? "Next face" : "Finish · enter dossier"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </CampaignShell>
  );
}
