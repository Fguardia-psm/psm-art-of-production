/**
 * Field Leader Brief (P0–P2)
 * Tactical aid for human follow-up — not agent-facing spreadsheet.
 * Same path, same canon, different mirror, different mission, better human follow-up.
 */
import {
  ARCHETYPES,
  type ArchetypeId,
  type BookStage,
  type ProductionForecast,
} from "@/lib/content";

export type FieldStage = BookStage; // new | growing | top-producer | building-agency

/** Agent-facing poetic labels (one signal only) */
export const STAGE_OPTIONS: {
  id: BookStage;
  label: string;
  short: string;
}[] = [
  {
    id: "new",
    label: "I’m building my first real book",
    short: "First book",
  },
  {
    id: "growing",
    label: "I have production but want consistency",
    short: "Growing",
  },
  {
    id: "top-producer",
    label: "I’m already producing and want leverage",
    short: "Elite production",
  },
  {
    id: "building-agency",
    label: "I’m building or leading an agency",
    short: "Agency",
  },
];

export function stageLabel(stage: BookStage | null | undefined): string {
  if (!stage) return "Unknown";
  return STAGE_OPTIONS.find((s) => s.id === stage)?.short ?? stage;
}

export function stagePacketValue(stage: BookStage | null | undefined): string {
  if (!stage) return "";
  const map: Record<BookStage, string> = {
    new: "new",
    growing: "growing",
    "top-producer": "elite",
    "building-agency": "agency",
  };
  return map[stage] ?? stage;
}

/** Suspected seasonal field leak (archetype default — not chapter-scored P3) */
export interface ArchetypeBriefCore {
  suspectedLeak: string;
  openWith: string;
  avoid: string;
  ask: string;
  offer: string;
  proof: string;
  /** Base next mission; stage adjusts via getStageAdjustedForecast */
  baseMission: string;
  measure: string;
  target: string;
  risk: string;
  breakthrough: string;
}

const BRIEFS: Record<ArchetypeId, ArchetypeBriefCore> = {
  cartographer: {
    suspectedLeak: "Map without feet — prep stays on paper instead of the calendar",
    openWith:
      "You’re not lacking intelligence. You’re lacking a field rhythm that turns the map into booked sits.",
    avoid: "Another PDF, carrier dump, or “study this and call me.”",
    ask: "Where are this week’s three review or renewal appointments on the calendar?",
    offer: "Market intel + calendar formation — prep that ends in motion.",
    proof: "Clean renewals list + three booked sits, not another spreadsheet.",
    baseMission: "Book 12 review or renewal appointments in the next 30 days.",
    measure: "Appointments on the calendar — not hours spent prepping.",
    target: "3 solid appointments per week for 4 weeks.",
    risk: "You prep forever and book too late.",
    breakthrough: "Fewer spreadsheets. More review appointments on the calendar.",
  },
  illuminator: {
    suspectedLeak: "Depth without formation — great conversations, empty calendar",
    openWith:
      "You win people, not arguments. The leak is pipeline and protected sit time — not craft.",
    avoid: "Product dump or “harder close” training that ignores the calendar.",
    ask: "What two sit blocks are non-negotiable on your calendar this week?",
    offer: "Mentorship + conversation mastery tied to a weekly sit rhythm.",
    proof: "Sits with a same-day next step — not “I’ll call you.”",
    baseMission:
      "Hold 16 client sits. After each one, write: client type + one thing you did differently.",
    measure: "Sits completed with a next step set the same day.",
    target: "About 4 sits per week.",
    risk: "Great conversations. Empty calendar. Burnout helping one person at a time.",
    breakthrough: "Protect sit time. Match the open to the person in the chair.",
  },
  quartermaster: {
    suspectedLeak: "Order without outreach — clean CRM, quiet funnel",
    openWith:
      "You don’t need more chaos. You need one channel the system can actually support.",
    avoid: "Random events, shiny tools, or “just post more.”",
    ask: "What one pharmacy, event, or follow-up channel will you run every week?",
    offer: "Tech and back-office leverage so formation scales without friction.",
    proof: "Open loops closed + outbound touches logged — not a prettier CRM.",
    baseMission:
      "Close every CRM loop older than 48 hours. Run your day plan 5 days a week. Add one pharmacy, event, or follow-up channel.",
    measure: "Open loops closed + outbound touches logged.",
    target: "15 outbound touches a day in your day plan; inbox clear by Friday.",
    risk: "CRM is clean. Pipeline is quiet. Order without outreach.",
    breakthrough: "Keep your daily rhythm — and add one place people already trust you.",
  },
  "field-marshal": {
    suspectedLeak: "Command from the office — structure grows, personal craft dulls",
    openWith:
      "You’re building an army. The exposed flank is when you stop writing business yourself.",
    avoid: "Generic “grow your agency” pitch with no personal production block.",
    ask: "Where is your personal production block this week — and will you keep it?",
    offer: "Agency infrastructure + training paths that still keep you on the field.",
    proof: "One weekly huddle + personal sits kept — not headcount alone.",
    baseMission:
      "Start a weekly team huddle and protect 8 hours of your own production time each week.",
    measure: "Team sits this month + your personal production hours kept.",
    target: "1 huddle per week; 8 personal production hours per week.",
    risk: "You build the agency from the office and stop writing business yourself.",
    breakthrough: "One scoreboard. One weekly huddle. One personal production block you do not cancel.",
  },
  "fire-bearer": {
    suspectedLeak: "Flame without craft — attention without booked sits",
    openWith:
      "You already create attention. The issue is converting fire into booked sits.",
    avoid: "Vanity metrics, more content for content’s sake, or “branding” with no path to the chair.",
    ask: "What is the reply → sit path for your one channel this week?",
    offer: "Marketing Hub + materials tied to conversations and enrollments.",
    proof: "Replies → sits → enrollments — not likes.",
    baseMission:
      "Send 4 useful messages or posts and turn replies into booked appointments.",
    measure: "Replies → sits → enrollments. Not likes.",
    target: "10 real replies and 6 sits from your marketing this month.",
    risk: "Lots of posts and activity. Not enough enrollments.",
    breakthrough:
      "One channel you tend every week — with a clear path from reply to booked sit.",
  },
};

/** Stage only adjusts mission language — no new route */
const STAGE_MISSIONS: Record<ArchetypeId, Record<BookStage, string>> = {
  cartographer: {
    new: "Book 8 review or renewal appointments in the next 30 days. Map is allowed — empty calendar is not.",
    growing: "Book 12 review or renewal appointments in 30 days — same three slots every week.",
    "top-producer": "Book 12 high-value reviews in 30 days. Drop one prep ritual that doesn’t create a sit.",
    "building-agency": "Book 10 personal reviews in 30 days and put the booking method on a one-page team map.",
  },
  illuminator: {
    new: "Hold 10 client sits in 30 days. After each, write the client type and one next step with a date.",
    growing: "Hold 16 client sits in 30 days with two protected sit blocks every week.",
    "top-producer": "Hold 16 sits in 30 days. Coach one peer open after every fourth sit.",
    "building-agency": "Hold 12 personal sits in 30 days and run one huddle teaching opens by client type.",
  },
  quartermaster: {
    new: "Close every CRM loop older than 48 hours. Log 10 outbound touches a day for 20 workdays.",
    growing: "Run your day plan 5 days a week. Add one pharmacy or follow-up channel and measure replies.",
    "top-producer": "Keep formation. Cut one tool or process that doesn’t create outbound this month.",
    "building-agency": "Install one shared day plan for the team. Keep your own 15 outbound touches daily.",
  },
  "field-marshal": {
    new: "Protect 6 hours of personal production each week for 4 weeks. One simple scoreboard only.",
    growing: "Weekly huddle + 8 personal production hours every week for 30 days.",
    "top-producer": "One scoreboard, one huddle, 8 personal production hours — no canceled blocks.",
    "building-agency": "Weekly huddle, one standard you won’t bend, and 8 personal production hours kept.",
  },
  "fire-bearer": {
    new: "Ship 4 useful posts or messages in 30 days. Turn every real reply into a booked sit attempt.",
    growing: "One channel every week. Target 10 replies and 6 sits from marketing this month.",
    "top-producer": "One channel only. Kill vanity metrics. 10 replies → 6 sits this month.",
    "building-agency": "One team channel with a reply→sit path. You still take 4 sits from that fire yourself.",
  },
};

export function getStageAdjustedForecast(
  archetype: ArchetypeId,
  stage: BookStage | null | undefined,
): ProductionForecast {
  const core = BRIEFS[archetype];
  const mission =
    stage && STAGE_MISSIONS[archetype][stage]
      ? STAGE_MISSIONS[archetype][stage]
      : core.baseMission;
  return {
    risk: core.risk,
    breakthrough: core.breakthrough,
    mission30: mission,
    measure: core.measure,
    target: core.target,
  };
}

export function getSuspectedFieldLeak(archetype: ArchetypeId): string {
  return BRIEFS[archetype].suspectedLeak;
}

export interface FieldLeaderBrief {
  archetype: ArchetypeId;
  archetypeName: string;
  stage: BookStage | null;
  stageLabel: string;
  fieldLeak: string;
  openWith: string;
  avoid: string;
  ask: string;
  offer: string;
  proof: string;
  nextMission: string;
  measure: string;
  target: string;
  /** Flat block for CRM / webhook / HubSpot note */
  plainText: string;
}

export function buildFieldLeaderBrief(input: {
  archetype: ArchetypeId;
  stage?: BookStage | null;
}): FieldLeaderBrief {
  const arch = ARCHETYPES[input.archetype];
  const core = BRIEFS[input.archetype];
  const stage = input.stage ?? null;
  const forecast = getStageAdjustedForecast(input.archetype, stage);
  const stageLbl = stageLabel(stage);

  const plainText = [
    `FIELD LEADER BRIEF — The Art of Production`,
    `Archetype: ${arch.name}`,
    `Stage: ${stage ? `${stagePacketValue(stage)} (${stageLbl})` : "unknown"}`,
    `Suspected field leak: ${core.suspectedLeak}`,
    ``,
    `Open with: ${core.openWith}`,
    `Avoid: ${core.avoid}`,
    `Ask: ${core.ask}`,
    `Offer: ${core.offer}`,
    `Proof to show: ${core.proof}`,
    `Next mission: ${forecast.mission30}`,
    `Measure: ${core.measure}`,
    `Target: ${core.target}`,
    ``,
    `USAGE TRACKING (required for campaign learning):`,
    `After the call, record ONE of:`,
    `1) Call notes mention archetype, stage, or field leak`,
    `2) Set property aop_brief_used = yes`,
    `3) Note: “brief changed opening” = yes`,
    `Self-report alone does not count as validated use.`,
  ].join("\n");

  return {
    archetype: input.archetype,
    archetypeName: arch.name,
    stage,
    stageLabel: stageLbl,
    fieldLeak: core.suspectedLeak,
    openWith: core.openWith,
    avoid: core.avoid,
    ask: core.ask,
    offer: core.offer,
    proof: core.proof,
    nextMission: forecast.mission30,
    measure: core.measure,
    target: core.target,
    plainText,
  };
}

/** Flat webhook fields for Field Leader Brief visibility in counsel workflow */
export function fieldLeaderBriefPacketFields(brief: FieldLeaderBrief) {
  return {
    field_leader_brief: brief.plainText,
    flb_archetype: brief.archetypeName,
    flb_stage: stagePacketValue(brief.stage),
    flb_stage_label: brief.stageLabel,
    flb_field_leak: brief.fieldLeak,
    flb_open_with: brief.openWith,
    flb_avoid: brief.avoid,
    flb_ask: brief.ask,
    flb_offer: brief.offer,
    flb_proof: brief.proof,
    flb_next_mission: brief.nextMission,
    flb_measure: brief.measure,
    flb_target: brief.target,
    /** HubSpot / Zapier: map to note body or aop_field_leader_brief */
    aop_brief_used: "", // field leader sets after call
    aop_brief_usage_instruction:
      "Set aop_brief_used=yes OR note archetype/stage/leak in call notes OR note brief changed opening",
  };
}
