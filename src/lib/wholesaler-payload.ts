import {
  ARCHETYPES,
  RECRUITER_OPENERS,
  buildRecruiterBrief,
  type ArchetypeId,
  type ChapterResult,
} from "@/lib/content";

/** Full intelligence packet for wholesalers / field leaders (Zapier → HubSpot). */
export function buildWholesalerPacket(input: {
  /** counsel_request | full_lead | funnel_event */
  kind?: "counsel_request" | "full_lead" | "test";
  source?: string;
  name?: string;
  email?: string;
  phone?: string;
  npn?: string;
  state?: string;
  bookStage?: string;
  focus?: string;
  archetype: ArchetypeId;
  readinessScore?: number;
  readinessLabel?: string;
  nineFacesScore?: number;
  chaptersDone?: number;
  weakestChapter?: string;
  strongestChapter?: string;
  fieldReportsSeen?: boolean;
  chapterResults?: Record<string, ChapterResult | string>;
  leaderCode?: string | null;
}) {
  const arch = ARCHETYPES[input.archetype];
  const opener = RECRUITER_OPENERS[input.archetype];
  const forecast = arch.forecast;

  const brief =
    input.name && input.email
      ? buildRecruiterBrief({
          name: input.name,
          email: input.email,
          phone: input.phone ?? "",
          npn: input.npn ?? "pending",
          state: input.state ?? "—",
          bookStage: input.bookStage ?? "unknown",
          focus: input.focus,
          archetype: input.archetype,
          nineFacesScore: input.nineFacesScore,
          chapterResults: input.chapterResults as Record<string, string> | undefined,
          readinessScore: input.readinessScore,
          readinessLabel: input.readinessLabel,
        })
      : [
          `RECRUITER BRIEF — The Art of Production`,
          `Archetype: ${arch.name} — ${arch.epithet}`,
          `Readiness: ${input.readinessScore ?? "—"}/100 ${input.readinessLabel ?? ""}`,
          `Nine Faces: ${input.nineFacesScore ?? "—"}/9`,
          `Mission (30d): ${forecast.mission30}`,
          `Risk: ${forecast.risk}`,
          `Breakthrough: ${forecast.breakthrough}`,
          `Monday: ${arch.mondayScript}`,
          `Open with: ${opener.openWith}`,
          `Proof: ${opener.proofAngle}`,
          `Avoid: ${opener.avoid}`,
        ].join("\n");

  /** Flat fields Zapier maps easily into HubSpot / Sheets */
  return {
    kind: input.kind ?? "counsel_request",
    event: "counsel_request",
    event_source: "art_of_production",
    source: input.source ?? "art-of-production",
    submittedAt: new Date().toISOString(),

    // Contact
    name: input.name ?? "",
    email: input.email ?? "",
    phone: input.phone ?? "",
    npn: input.npn ?? "",
    state: input.state ?? "",
    bookStage: input.bookStage ?? "",
    focus: input.focus ?? "",

    // Identity / intelligence (wholesaler close pack)
    archetype: input.archetype,
    archetype_name: arch.name,
    archetype_epithet: arch.epithet,
    archetype_seal: arch.seal,
    archetype_summary: arch.summary,
    monday_script: arch.mondayScript,
    season_focus: arch.seasonFocus,
    blind_spot: arch.blindSpot,
    psm_move: arch.psmMove,
    strengths: arch.strengths.join(" | "),

    readiness: input.readinessScore ?? null,
    readiness_label: input.readinessLabel ?? "",
    nine_faces_score: input.nineFacesScore ?? null,
    chapters_done: input.chaptersDone ?? null,
    strongest_chapter: input.strongestChapter ?? "",
    weakest_chapter: input.weakestChapter ?? "",
    field_reports_seen: Boolean(input.fieldReportsSeen),
    leader_code: input.leaderCode ?? "",

    // Production forecast
    mission_30: forecast.mission30,
    measure: forecast.measure,
    target: forecast.target,
    risk: forecast.risk,
    breakthrough: forecast.breakthrough,

    // Talk tracks
    recruiter_open_with: opener.openWith,
    recruiter_proof_angle: opener.proofAngle,
    recruiter_avoid: opener.avoid,
    recruiter_brief: brief,

    // One-line for Slack / HubSpot note title
    wholesaler_headline: [
      arch.name,
      input.readinessScore != null ? `Ready ${input.readinessScore}` : null,
      input.nineFacesScore != null ? `Faces ${input.nineFacesScore}/9` : null,
      input.weakestChapter ? `Watch: ${input.weakestChapter}` : null,
    ]
      .filter(Boolean)
      .join(" · "),

    // Call script block (paste into CRM note)
    wholesaler_talk_track: [
      `OPEN: ${opener.openWith}`,
      `THEIR 30-DAY MISSION: ${forecast.mission30}`,
      `MEASURE: ${forecast.measure} → TARGET: ${forecast.target}`,
      `RISK: ${forecast.risk}`,
      `PROOF TO LEAN ON: ${opener.proofAngle}`,
      `DO NOT: ${opener.avoid}`,
      `THEIR MONDAY MOVE: ${arch.mondayScript}`,
      input.strongestChapter
        ? `STRENGTH IN CAMPAIGN: ${input.strongestChapter}`
        : null,
      input.weakestChapter
        ? `COACH FIRST: ${input.weakestChapter}`
        : null,
    ]
      .filter(Boolean)
      .join("\n"),

    chapter_results: input.chapterResults ?? {},
  };
}
