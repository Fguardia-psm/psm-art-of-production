import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitCounselIntent } from "@/lib/leads";
import { buildWholesalerPacket } from "@/lib/wholesaler-payload";
import { track } from "@/lib/analytics";
import {
  PSM_CONTACT_URL,
  fieldLeaderUrl,
  type ArchetypeId,
  type ChapterResult,
} from "@/lib/content";
import { ArrowRight, ExternalLink, Loader2 } from "lucide-react";

type Props = {
  archetype: ArchetypeId;
  source: string;
  readinessScore: number;
  readinessLabel: string;
  nineFacesScore: number;
  chaptersDone: number;
  weakestChapter?: string;
  strongestChapter?: string;
  fieldReportsSeen?: boolean;
  chapterResults?: Record<string, ChapterResult | string>;
  leaderCode?: string | null;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  tone?: "paper" | "ink";
};

/**
 * Soft counsel gate → Zapier/HubSpot with full wholesaler intelligence.
 * Success-first (no surprise tab). Consent required.
 */
export function CounselHandoff(props: Props) {
  const [name, setName] = useState(props.defaultName ?? "");
  const [email, setEmail] = useState(props.defaultEmail ?? "");
  const [phone, setPhone] = useState(
    (props.defaultPhone ?? "").replace(/\D/g, ""),
  );
  const [consented, setConsented] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [contactHref, setContactHref] = useState(PSM_CONTACT_URL);

  const ink = props.tone === "ink";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleanPhone = phone.replace(/\D/g, "");
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required so a field leader can reach you.");
      return;
    }
    if (!consented) {
      setError("Please confirm we may contact you about partnership.");
      return;
    }
    if (cleanPhone && (cleanPhone.length < 10 || cleanPhone.length > 15)) {
      setError("Phone should be 10–15 digits, or leave it blank.");
      return;
    }

    setBusy(true);
    try {
      const packet = buildWholesalerPacket({
        kind: "counsel_request",
        source: props.source,
        name: name.trim(),
        email: email.trim(),
        phone: cleanPhone || undefined,
        archetype: props.archetype,
        readinessScore: props.readinessScore,
        readinessLabel: props.readinessLabel,
        nineFacesScore: props.nineFacesScore,
        chaptersDone: props.chaptersDone,
        weakestChapter: props.weakestChapter,
        strongestChapter: props.strongestChapter,
        fieldReportsSeen: props.fieldReportsSeen,
        chapterResults: props.chapterResults,
        leaderCode: props.leaderCode,
      });

      await submitCounselIntent({
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: cleanPhone || "",
          archetype: props.archetype,
          source: props.source,
          readinessScore: props.readinessScore,
          readinessLabel: props.readinessLabel,
          nineFacesScore: props.nineFacesScore,
          chaptersDone: props.chaptersDone,
          weakestChapter: props.weakestChapter,
          strongestChapter: props.strongestChapter,
          fieldReportsSeen: props.fieldReportsSeen,
          chapterResults: props.chapterResults as
            | Record<string, string>
            | undefined,
          leaderCode: props.leaderCode,
          mission30: packet.mission_30,
          mondayScript: packet.monday_script,
          recruiterOpenWith: packet.recruiter_open_with,
          recruiterProofAngle: packet.recruiter_proof_angle,
          recruiterAvoid: packet.recruiter_avoid,
          recruiterBrief: packet.recruiter_brief,
          wholesalerHeadline: packet.wholesaler_headline,
          wholesalerTalkTrack: packet.wholesaler_talk_track,
          consented: true,
          packet: packet as Record<string, unknown>,
        },
      });

      track("counsel_click", {
        source: props.source,
        archetype: props.archetype,
        readiness: props.readinessScore,
        webhook: true,
      });

      const href = fieldLeaderUrl({
        archetype: props.archetype,
        name: name.trim().split(" ")[0],
        readiness: props.readinessScore,
        readinessLabel: props.readinessLabel,
        nineFacesScore: props.nineFacesScore,
        chaptersDone: props.chaptersDone,
        weakestChapter: props.weakestChapter,
        strongestChapter: props.strongestChapter,
        fieldReportsSeen: props.fieldReportsSeen,
        mission: packet.mission_30,
        utmContent: `${props.source}-counsel`,
      });
      setContactHref(href);
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the field team system. Use Contact Us or try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const label = ink ? "text-parchment/55" : "text-charcoal-soft";
  const inputBase = ink
    ? "w-full rounded-md border border-parchment/20 bg-parchment/5 px-3 py-2.5 font-body text-sm text-parchment placeholder:text-parchment/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-brass/60"
    : "w-full rounded-md border border-charcoal/15 bg-parchment px-3 py-2.5 font-body text-sm text-charcoal placeholder:text-charcoal-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brass/50";

  if (sent) {
    return (
      <div
        className={
          ink
            ? "rounded-lg border border-brass/35 bg-brass/10 px-4 py-5 space-y-4"
            : "rounded-lg border border-brass/30 bg-brass/8 px-4 py-5 space-y-4"
        }
        role="status"
      >
        <div>
          <p
            className={
              ink
                ? "font-display text-lg text-parchment"
                : "font-display text-lg text-charcoal"
            }
          >
            Request received
          </p>
          <p
            className={
              ink
                ? "mt-2 font-body text-sm text-parchment/65 leading-relaxed"
                : "mt-2 font-body text-sm text-charcoal-muted leading-relaxed"
            }
          >
            A field leader has your name, archetype, readiness score, and 30-day
            plan. Expect outreach within 1–2 business days.
          </p>
        </div>
        <Button asChild variant={ink ? "secondary" : "outline"} size="lg">
          <a href={contactHref} target="_blank" rel="noreferrer">
            Add more on Contact Us
            <ExternalLink className="size-4" />
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl" noValidate>
      <p className={`font-ui text-[10px] uppercase tracking-[0.18em] ${label}`}>
        Request counsel
      </p>
      <p
        className={
          ink
            ? "font-body text-sm text-parchment/65 leading-relaxed"
            : "font-body text-sm text-charcoal-muted leading-relaxed"
        }
      >
        Leave your name and email. We send your campaign reading (archetype,
        readiness, 30-day plan, talk tracks) to a PSM field leader so the
        conversation starts with context — not a cold pitch.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={`font-ui text-[10px] uppercase tracking-[0.14em] ${label}`}>
            Full name
          </span>
          <input
            className={`mt-1 ${inputBase}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            maxLength={120}
            aria-invalid={Boolean(error && !name.trim())}
          />
        </label>
        <label className="block">
          <span className={`font-ui text-[10px] uppercase tracking-[0.14em] ${label}`}>
            Email
          </span>
          <input
            type="email"
            className={`mt-1 ${inputBase}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            maxLength={200}
            aria-describedby="counsel-email-hint"
          />
          <span
            id="counsel-email-hint"
            className={`mt-1 block font-ui text-[10px] ${label}`}
          >
            Used only so a field leader can reach you
          </span>
        </label>
        <label className="block sm:col-span-2">
          <span className={`font-ui text-[10px] uppercase tracking-[0.14em] ${label}`}>
            Mobile (optional)
          </span>
          <input
            type="tel"
            className={`mt-1 ${inputBase}`}
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 15))
            }
            autoComplete="tel"
            inputMode="numeric"
            placeholder="10-digit mobile"
          />
        </label>
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
          className="mt-1 size-4 shrink-0 rounded border-brass/50 accent-[var(--color-brass)]"
          required
        />
        <span
          className={
            ink
              ? "font-body text-xs text-parchment/70 leading-relaxed"
              : "font-body text-xs text-charcoal-muted leading-relaxed"
          }
        >
          I agree that PSM Brokerage may contact me about training, markets, and
          partnership.{" "}
          <a
            href="https://www.psmbrokerage.com/privacy-policy"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            Privacy
          </a>
        </span>
      </label>

      <input
        type="text"
        name="companyWebsite"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden
      />

      {error ? (
        <p className="font-body text-sm text-ember" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="xl" disabled={busy}>
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Request counsel · win the field
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
      <p className={`font-ui text-[11px] leading-relaxed ${label}`}>
        Your wholesaler receives: archetype, readiness, Nine Faces score,
        chapter scorecard, 30-day mission, Monday move, and call talk tracks.
      </p>
    </form>
  );
}
