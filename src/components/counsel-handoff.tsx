import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitCounselIntent } from "@/lib/leads";
import { buildWholesalerPacket } from "@/lib/wholesaler-payload";
import { track } from "@/lib/analytics";
import { fieldLeaderUrl, type ArchetypeId } from "@/lib/content";
import type { ChapterResult } from "@/lib/content";
import { ArrowRight, Loader2 } from "lucide-react";

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
  /** ink = parchment-on-dark panel */
  tone?: "paper" | "ink";
};

/**
 * Soft counsel gate: name + email (+ phone) → Zapier webhook with full
 * wholesaler intelligence, then open PSM contact with query intel.
 */
export function CounselHandoff(props: Props) {
  const [name, setName] = useState(props.defaultName ?? "");
  const [email, setEmail] = useState(props.defaultEmail ?? "");
  const [phone, setPhone] = useState(
    (props.defaultPhone ?? "").replace(/\D/g, ""),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const ink = props.tone === "ink";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleanPhone = phone.replace(/\D/g, "");
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required so a field leader can reach you.");
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
          packet: packet as Record<string, unknown>,
        },
      });

      track("counsel_click", {
        source: props.source,
        archetype: props.archetype,
        readiness: props.readinessScore,
        webhook: true,
      });

      setSent(true);

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
      window.open(href, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not submit. Try again or use Contact Us.",
      );
    } finally {
      setBusy(false);
    }
  }

  const label = ink ? "text-parchment/55" : "text-charcoal-soft";
  const input = ink
    ? "w-full rounded-md border border-parchment/20 bg-parchment/5 px-3 py-2.5 font-body text-sm text-parchment placeholder:text-parchment/35 focus:outline-none focus:ring-2 focus:ring-brass/50"
    : "w-full rounded-md border border-charcoal/15 bg-parchment px-3 py-2.5 font-body text-sm text-charcoal placeholder:text-charcoal-soft focus:outline-none focus:ring-2 focus:ring-brass/40";

  if (sent) {
    return (
      <div
        className={
          ink
            ? "rounded-lg border border-brass/35 bg-brass/10 px-4 py-4"
            : "rounded-lg border border-brass/30 bg-brass/8 px-4 py-4"
        }
      >
        <p
          className={
            ink
              ? "font-display text-lg text-parchment"
              : "font-display text-lg text-charcoal"
          }
        >
          Request sent to the field team
        </p>
        <p
          className={
            ink
              ? "mt-2 font-body text-sm text-parchment/65 leading-relaxed"
              : "mt-2 font-body text-sm text-charcoal-muted leading-relaxed"
          }
        >
          Your archetype, readiness, and 30-day plan went with it. A contact
          page also opened so you can add anything else. Typical follow-up is
          1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
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
        score, 30-day mission, talk tracks) to a PSM field leader so the call
        starts warm — not cold.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-1">
          <span className={`font-ui text-[10px] uppercase tracking-[0.14em] ${label}`}>
            Name
          </span>
          <input
            className={`mt-1 ${input}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            maxLength={120}
          />
        </label>
        <label className="block sm:col-span-1">
          <span className={`font-ui text-[10px] uppercase tracking-[0.14em] ${label}`}>
            Email
          </span>
          <input
            type="email"
            className={`mt-1 ${input}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            maxLength={200}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={`font-ui text-[10px] uppercase tracking-[0.14em] ${label}`}>
            Phone (optional)
          </span>
          <input
            type="tel"
            className={`mt-1 ${input}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 15))}
            autoComplete="tel"
            inputMode="numeric"
            placeholder="10-digit mobile"
          />
        </label>
      </div>
      {/* honeypot */}
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
        Includes: archetype, readiness, Nine Faces score, chapter scorecard,
        30-day mission, Monday move, and open/proof/avoid talk tracks for your
        wholesaler.
      </p>
    </form>
  );
}
