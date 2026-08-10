import { useState } from "react";
import {
  createFileRoute,
  Link,
  Navigate,
  useNavigate,
} from "@tanstack/react-router";
import { CampaignShell, SectionKicker } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BOOK_STAGES,
  US_STATES,
  type BookStage,
} from "@/lib/content";
import { requiredProgress, useCampaignStore } from "@/lib/campaign-store";
import { submitLead } from "@/lib/leads";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/unlock")({
  component: UnlockPage,
});

function UnlockPage() {
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
        consented: true,
        submittedAt: new Date().toISOString(),
        archetype: state.provisionalArchetype ?? "cartographer",
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

  return (
    <CampaignShell>
      <div className="mx-auto max-w-lg animate-fade-up">
        <SectionKicker>Campaign kit</SectionKicker>
        <h1 className="mt-3 font-display text-3xl text-charcoal sm:text-4xl">
          Unlock your campaign kit
        </h1>
        <p className="mt-3 font-body text-charcoal-muted leading-relaxed">
          Enter your credentials. Claim your full archetype dossier, the sealed
          map, and the manual. NPN verifies you walk this field.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Full name" htmlFor="name">
            <Input
              id="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jordan Hale"
            />
          </Field>
          <Field label="Work email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
            />
          </Field>
          <Field label="Mobile phone" htmlFor="phone">
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 000-0000"
            />
          </Field>
          <Field label="NPN" htmlFor="npn">
            <Input
              id="npn"
              inputMode="numeric"
              value={npn}
              onChange={(e) => setNpn(e.target.value)}
              placeholder="National Producer Number"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary license state" htmlFor="state">
              <select
                id="state"
                value={licenseState}
                onChange={(e) => setLicenseState(e.target.value)}
                className={cn(
                  "flex h-11 w-full rounded-md border border-charcoal/15 bg-parchment px-3.5 font-ui text-sm text-charcoal shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40",
                )}
              >
                <option value="">Select state</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Book stage" htmlFor="stage">
              <select
                id="stage"
                value={bookStage}
                onChange={(e) => setBookStage(e.target.value as BookStage | "")}
                className={cn(
                  "flex h-11 w-full rounded-md border border-charcoal/15 bg-parchment px-3.5 font-ui text-sm text-charcoal shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40",
                )}
              >
                <option value="">Select stage</option>
                {BOOK_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Primary focus (optional)" htmlFor="focus">
            <select
              id="focus"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className={cn(
                "flex h-11 w-full rounded-md border border-charcoal/15 bg-parchment px-3.5 font-ui text-sm text-charcoal shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40",
              )}
            >
              <option value="">Prefer not to say</option>
              <option value="medicare">Medicare</option>
              <option value="lh">Life & Health</option>
              <option value="both">Both</option>
            </select>
          </Field>

          <label className="flex items-start gap-3 rounded-lg border border-charcoal/10 bg-parchment/60 px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 size-4 accent-[var(--color-brass)]"
            />
            <span className="font-ui text-sm text-charcoal-muted leading-snug">
              I am a licensed insurance agent. PSM may contact me about
              partnership and send agent-use materials related to The Art of
              Production.
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
            size="xl"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Sealing credentials…" : "Claim the kit"}
          </Button>

          <p className="text-center font-ui text-[11px] text-charcoal-soft">
            For licensed agents. NPN verifies you walk this field.{" "}
            <Link to="/map" className="underline underline-offset-2">
              Return to map
            </Link>
          </p>
        </form>
      </div>
    </CampaignShell>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
