import { useState } from "react";
import {
  createFileRoute,
  Link,
  Navigate,
  useNavigate,
} from "@tanstack/react-router";
import { CampaignShell, SectionKicker } from "@/components/shell";
import { CampaignGate } from "@/components/campaign-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ARCHETYPES,
  BOOK_STAGES,
  RECRUITER_OPENERS,
  US_STATES,
  buildRecruiterBrief,
  resultLabel,
  type ArchetypeId,
  type BookStage,
} from "@/lib/content";
import { requiredProgress, useCampaignStore } from "@/lib/campaign-store";
import { computeReadiness } from "@/lib/readiness";
import { submitLead } from "@/lib/leads";
import { cn } from "@/lib/utils";

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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [npn, setNpn] = useState("");
  const [licenseState, setLicenseState] = useState("");
  const [bookStage, setBookStage] = useState<BookStage | "">("");
  const [focus, setFocus] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!state.scoutComplete) return <Navigate to="/scout" />;
  if (!progress.readyForGate) return <Navigate to="/map" />;
  if (state.unlocked) return <Navigate to="/dossier" />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanNpn = npn.replace(/\D/g, "");
    if (!name.trim()) return setError("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError("Enter a valid work email.");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10)
      return setError("Enter a valid mobile phone number.");
    if (cleanNpn.length < 5 || cleanNpn.length > 10)
      return setError("Enter a valid NPN (5–10 digits).");
    if (!licenseState) return setError("Select your primary license state.");
    if (!bookStage) return setError("Select your book stage.");
    if (!consent)
      return setError("Confirm consent to continue as a licensed agent.");

    const archetype = (state.provisionalArchetype ??
      "cartographer") as ArchetypeId;
    const opener = RECRUITER_OPENERS[archetype];
    const chapterResults = Object.fromEntries(
      Object.entries(state.chapterResults).map(([k, v]) => [
        k,
        resultLabel(v),
      ]),
    );
    const readiness = computeReadiness(state);
    const recruiterBrief = buildRecruiterBrief({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: digits,
      npn: cleanNpn,
      state: licenseState,
      bookStage: bookStage as string,
      focus: focus || undefined,
      archetype,
      nineFacesScore: state.nineFacesScore,
      chapterResults,
      readinessScore: readiness.score,
      readinessLabel: readiness.label,
    });

    setSubmitting(true);
    try {
      const lead = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: digits,
        npn: cleanNpn,
        state: licenseState,
        bookStage: bookStage as BookStage,
        focus: focus || undefined,
        consented: true as const,
        submittedAt: new Date().toISOString(),
        archetype,
        recruiterBrief,
        recruiterOpenWith: opener.openWith,
        recruiterProofAngle: opener.proofAngle,
        recruiterAvoid: opener.avoid,
        nineFacesScore: state.nineFacesScore,
        chapterResults,
        source: "art-of-production",
      };
      await submitLead({ data: lead });
      state.unlock({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        npn: lead.npn,
        state: lead.state,
        bookStage: lead.bookStage,
        focus: lead.focus,
        consented: true,
        submittedAt: lead.submittedAt,
      });
      navigate({ to: "/dossier" });
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const archPreview = state.provisionalArchetype
    ? ARCHETYPES[state.provisionalArchetype]
    : null;

  return (
    <CampaignShell>
      <div className="mx-auto max-w-lg animate-fade-up">
        <SectionKicker>Campaign kit</SectionKicker>
        <h1 className="mt-3 font-display text-3xl text-charcoal sm:text-4xl">
          Unlock your campaign kit
        </h1>
        <p className="mt-3 font-body text-charcoal-muted leading-relaxed">
          Enter your credentials. Claim your full archetype dossier, Field
          Reports, and the manual. NPN verifies you walk this field — and routes
          a recruiter brief with your talk track to the team.
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
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="npn">NPN</Label>
              <Input
                id="npn"
                inputMode="numeric"
                value={npn}
                onChange={(e) => setNpn(e.target.value)}
                placeholder="5–10 digits"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Primary license state</Label>
              <select
                id="state"
                value={licenseState}
                onChange={(e) => setLicenseState(e.target.value)}
                className={cn(
                  "flex h-11 w-full rounded-md border border-charcoal/15 bg-parchment px-3 font-ui text-sm text-charcoal",
                )}
                required
              >
                <option value="">Select…</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stage">Book stage</Label>
            <select
              id="stage"
              value={bookStage}
              onChange={(e) => setBookStage(e.target.value as BookStage | "")}
              className="flex h-11 w-full rounded-md border border-charcoal/15 bg-parchment px-3 font-ui text-sm text-charcoal"
              required
            >
              <option value="">Select…</option>
              {BOOK_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="focus">What are you building next? (optional)</Label>
            <Input
              id="focus"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. AEP systems, agency ramp, market expand"
            />
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-charcoal/10 bg-parchment/60 px-3 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 size-4 accent-[var(--color-brass)]"
            />
            <span className="font-body text-sm text-charcoal leading-snug">
              I am a licensed insurance agent and consent to PSM contacting me
              about partnership. For Agent Use Only.
            </span>
          </label>

          {error ? (
            <p className="font-ui text-sm text-ember" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="paper"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Sealing…" : "Unlock campaign kit"}
          </Button>
        </form>

        <p className="mt-6 text-center">
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
