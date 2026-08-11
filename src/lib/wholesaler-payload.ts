import {
  ARCHETYPES,
  RECRUITER_OPENERS,
  buildRecruiterBrief,
  type ArchetypeId,
  type BookStage,
  type ChapterResult,
} from "@/lib/content";
import {
  buildFieldLeaderBrief,
  fieldLeaderBriefPacketFields,
  getStageAdjustedForecast,
} from "@/lib/field-leader-brief";

/** Full intelligence packet for field leaders (Zapier → HubSpot). */
export function buildWholesalerPacket(input: {
  kind?: "counsel_request" | "full_lead" | "test";
  source?: string;
  name?: string;
  email?: string;
  phone?: string;
  npn?: string;
  state?: string;
  bookStage?: BookStage | string;
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
  const stage =
    input.bookStage === "new" ||
    input.bookStage === "growing" ||
    input.bookStage === "top-producer" ||
    input.bookStage === "building-agency"
      ? (input.bookStage as BookStage)
      : null;
  const forecast = getStageAdjustedForecast(input.archetype, stage);
  const flb = buildFieldLeaderBrief({
    archetype: input.archetype,
    stage,
  });
  const flbFields = fieldLeaderBriefPacketFields(flb);

  const brief =
    input.name && input.email
      ? [
          flb.plainText,
          ``,
          buildRecruiterBrief({
            name: input.name,
            email: input.email,
            phone: input.phone ?? "",
            npn: input.npn ?? "pending",
            state: input.state ?? "—",
            bookStage: input.bookStage ?? "unknown",
            focus: input.focus,
            archetype: input.archetype,
            nineFacesScore: input.nineFacesScore,
            chapterResults: input.chapterResults as
              | Record<string, string>
              | undefined,
            readinessScore: input.readinessScore,
            readinessLabel: input.readinessLabel,
          }),
        ].join("\n")
      : flb.plainText;

  return {
    kind: input.kind ?? "counsel_request",
    event: "counsel_request",
    event_source: "art_of_production",
    source: input.source ?? "art-of-production",
    submittedAt: new Date().toISOString(),

    name: input.name ?? "",
    email: input.email ?? "",
    phone: input.phone ?? "",
    npn: input.npn ?? "",
    state: input.state ?? "",
    bookStage: stage ?? input.bookStage ?? "",
    focus: input.focus ?? "",

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

    mission_30: forecast.mission30,
    measure: forecast.measure,
    target: forecast.target,
    risk: forecast.risk,
    breakthrough: forecast.breakthrough,

    recruiter_open_with: flb.openWith,
    recruiter_proof_angle: flb.proof,
    recruiter_avoid: flb.avoid,
    recruiter_brief: brief,

    // Field Leader Brief — primary counsel workflow surface
    ...flbFields,

    wholesaler_headline: [
      arch.name,
      stage ? flb.stageLabel : null,
      flb.fieldLeak.split("—")[0]?.trim() ?? null,
    ]
      .filter(Boolean)
      .join(" · "),

    wholesaler_talk_track: [
      `FIELD LEADER BRIEF`,
      `Archetype: ${arch.name}`,
      `Stage: ${flb.stageLabel}`,
      `Field leak: ${flb.fieldLeak}`,
      `OPEN: ${flb.openWith}`,
      `AVOID: ${flb.avoid}`,
      `ASK: ${flb.ask}`,
      `OFFER: ${flb.offer}`,
      `PROOF: ${flb.proof}`,
      `NEXT MISSION: ${flb.nextMission}`,
      `MEASURE: ${flb.measure} → TARGET: ${flb.target}`,
      ``,
      `After call — mark use: aop_brief_used=yes OR note leak/stage in call notes OR “brief changed opening”`,
    ].join("\n"),

    chapter_results: input.chapterResults ?? {},
  };
}
