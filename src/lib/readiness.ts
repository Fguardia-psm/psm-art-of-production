import type { ChapterResult, ChapterSlug } from "./content";
import { REQUIRED_CHAPTERS, REQUIRED_CHAPTER_SLUGS } from "./content";

const RESULT_PTS: Record<ChapterResult, number> = {
  victory: 12,
  "field-note": 8,
  lesson: 4,
};

const RESULT_RANK: Record<ChapterResult, number> = {
  victory: 3,
  "field-note": 2,
  lesson: 1,
};

/** Readiness 0–100 — how complete the campaign is for a real field conversation. */
export function computeReadiness(input: {
  scoutComplete: boolean;
  chapterResults: Record<string, ChapterResult>;
  completedChapters: ChapterSlug[];
  nineFacesComplete: boolean;
  nineFacesScore: number;
  fieldReportsSeen: boolean;
  unlocked: boolean;
}): {
  score: number;
  band: "forming" | "ready" | "field-ready" | "campaign-sealed";
  label: string;
  parts: { label: string; pts: number; max: number }[];
} {
  const parts: { label: string; pts: number; max: number }[] = [];

  const scoutPts = input.scoutComplete ? 10 : 0;
  parts.push({ label: "Archetype scout", pts: scoutPts, max: 10 });

  let chapterPts = 0;
  const chapterMax = REQUIRED_CHAPTER_SLUGS.length * 12;
  for (const slug of REQUIRED_CHAPTER_SLUGS) {
    const r = input.chapterResults[slug];
    if (r) chapterPts += RESULT_PTS[r];
  }
  parts.push({ label: "Campaign seals", pts: chapterPts, max: chapterMax });

  const facePts = input.nineFacesComplete
    ? Math.round((input.nineFacesScore / 9) * 25)
    : 0;
  parts.push({ label: "Nine Faces", pts: facePts, max: 25 });

  const unlockPts = input.unlocked ? 5 : 0;
  parts.push({ label: "Kit claimed", pts: unlockPts, max: 5 });

  const proofPts = input.fieldReportsSeen ? 10 : 0;
  parts.push({ label: "Field Reports", pts: proofPts, max: 10 });

  const raw = scoutPts + chapterPts + facePts + unlockPts + proofPts;
  const max = 10 + chapterMax + 25 + 5 + 10;
  const score = Math.min(100, Math.round((raw / max) * 100));

  let band: "forming" | "ready" | "field-ready" | "campaign-sealed" = "forming";
  let label = "Forming — walk the quiet months";
  if (score >= 85) {
    band = "campaign-sealed";
    label = "Campaign sealed — ready for the field conversation";
  } else if (score >= 65) {
    band = "field-ready";
    label = "Field-ready — claim proof, then the call";
  } else if (score >= 35) {
    band = "ready";
    label = "Rising — seals forming on the map";
  }

  return { score, band, label, parts };
}

/** Weakest / strongest required chapter labels for recruiter intel */
export function chapterScorecard(
  chapterResults: Record<string, ChapterResult>,
): { weakest?: string; strongest?: string; done: number } {
  const scored = REQUIRED_CHAPTERS.map((c) => {
    const r = chapterResults[c.slug as ChapterSlug];
    return {
      title: c.title,
      rank: r ? RESULT_RANK[r] : 0,
      has: Boolean(r),
    };
  }).filter((x) => x.has);

  if (!scored.length) return { done: 0 };

  let weakest = scored[0]!;
  let strongest = scored[0]!;
  for (const s of scored) {
    if (s.rank < weakest.rank) weakest = s;
    if (s.rank > strongest.rank) strongest = s;
  }
  return {
    weakest: weakest.title,
    strongest: strongest.title,
    done: scored.length,
  };
}
