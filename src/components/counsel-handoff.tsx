import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { submitCounselIntent } from "@/lib/leads";
import { buildWholesalerPacket } from "@/lib/wholesaler-payload";
import { track } from "@/lib/analytics";
import {
  PSM_CONTACT_URL,
  fieldLeaderUrl,
  type ArchetypeId,
  type BookStage,
  type ChapterResult,
} from "@/lib/content";
import { useCampaignStore } from "@/lib/campaign-store";
import { STAGE_OPTIONS } from "@/lib/field-leader-brief";
import { ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
 * Soft counsel gate → Field Leader Brief in counsel workflow.
 * After submit: persisted post-submit state so dossier/reports/partner stop asking.
 */
export function CounselHandoff(props: Props) {
  const storeStage = useCampaignStore((s) => s.bookStage);
  const setBookStage = useCampaignStore((s) => s.setBookStage);
  const counselRequested = useCampaignStore((s) => s.counselRequested);
  const markCounselRequested = useCampaignStore((s) => s.markCounselRequested);
  const [name, setName] = useState(props.defaultName ?? "");
  const [email, setEmail] = useState(props.defaultEmail ?? "");
  const [phone, setPhone] = useState(
    (props.defaultPhone ?? "").replace(/\D/g, ""),
  );
  const [stage, setStage] = useState<BookStage | null>(storeStage);
  const [consented, setConsented] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSent, setJustSent] = useState(false);

  const ink = props.tone === "ink";
  const done = counselRequested || justSent;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleanPhone = phone.replace(/\D/g, "");
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required so a field leader can reach you.");
      return;
    }
    if (!stage) {
      setError("Tell us which field you’re standing in — it shapes the brief.");
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
      if (stage !== storeStage) setBookStage(stage);

      const packet = buildWholesalerPacket({
        kind: "counsel_request",
        source: props.source,
        name: name.trim(),
        email: email.trim(),
        phone: cleanPhone || undefined,
        bookStage: stage,
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
          bookStage: stage,
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
        stage,
        readiness: props.readinessScore,
        webhook: true,
      });

      markCounselRequested();
      setJustSent(true);
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

  if (done) {
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
                ? "font-ui text-[10px] uppercase tracking-[0.2em] text-brass-bright"
                : "font-ui text-[10px] uppercase tracking-[0.2em] text-brass"
            }
          >
            Counsel requested
          </p>
          <p
            className={
              ink
                ? "mt-2 font-display text-lg text-parchment"
                : "mt-2 font-display text-lg text-charcoal"
            }
          >
            Your field brief is ready for the follow-up conversation
          </p>
          <p
            className={
              ink
                ? "mt-2 font-body text-sm text-parchment/65 leading-relaxed"
                : "mt-2 font-body text-sm text-charcoal-muted leading-relaxed"
            }
          >
            Your Field Leader Brief has been sent to PSM so the conversation can
            start with context. Bring your Field Seal and 30-day plan. Expect
            outreach within 1–2 business days.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button asChild variant={ink ? "secondary" : "outline"} size="lg">
            <Link to="/dossier">View my dossier</Link>
          </Button>
          <Button asChild variant={ink ? "secondary" : "outline"} size="lg">
            <a href="/dossier#field-seal">Print Field Seal</a>
          </Button>
          <Button asChild variant={ink ? "secondary" : "outline"} size="lg">
            <Link to="/field-reports">Review Field Reports</Link>
          </Button>
        </div>
        <p className={`font-ui text-[11px] leading-relaxed ${label}`}>
          Need to add something?{" "}
          <a
            href={PSM_CONTACT_URL}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            Contact Us
            <ExternalLink className="ml-1 inline size-3 align-text-bottom" />
          </a>
        </p>
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
        Leave your name and email. We send a Field Leader Brief (your archetype,
        field, next mission, and how to open the call) so follow-up starts with
        context — not a cold pitch.
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
          />
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

      {!storeStage ? (
        <fieldset>
          <legend className={`font-ui text-[10px] uppercase tracking-[0.14em] ${label}`}>
            Which field are you standing in?
          </legend>
          <ul className="mt-2 space-y-2">
            {STAGE_OPTIONS.map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => setStage(opt.id)}
                  className={cn(
                    "w-full rounded-md border px-3 py-2.5 text-left font-body text-sm transition",
                    stage === opt.id
                      ? ink
                        ? "border-brass bg-brass/15 text-parchment"
                        : "border-brass bg-brass/10 text-charcoal"
                      : ink
                        ? "border-parchment/20 text-parchment/70 hover:border-brass/40"
                        : "border-charcoal/15 text-charcoal-muted hover:border-brass/40",
                  )}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : null}

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
          I agree that PSM Brokerage may contact me about training, market
          support, and partnership opportunities.{" "}
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
            Request counsel · bring my field plan
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
      <p className={`font-ui text-[11px] leading-relaxed ${label}`}>
        Your field leader receives: archetype, stage, field leak, open / avoid /
        ask / offer / proof, and next mission.
      </p>
    </form>
  );
}
