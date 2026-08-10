import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ArchetypeId,
  BookStage,
  ChapterResult,
  ChapterSlug,
} from "./content";
import { REQUIRED_CHAPTER_SLUGS, scoreArchetype } from "./content";

export interface LeadProfile {
  name: string;
  email: string;
  phone: string;
  npn: string;
  state: string;
  bookStage: BookStage;
  focus?: string;
  consented: boolean;
  submittedAt: string;
}

interface CampaignState {
  scoutAnswers: Record<string, number>;
  scoutComplete: boolean;
  provisionalArchetype: ArchetypeId | null;
  completedChapters: ChapterSlug[];
  chapterResults: Record<string, ChapterResult>;
  nineFacesComplete: boolean;
  nineFacesScore: number;
  unlocked: boolean;
  lead: LeadProfile | null;
  leaderCode: string | null;
  fieldReportsSeen: boolean;
  setScoutAnswer: (questionId: string, optionIndex: number) => void;
  completeScout: () => void;
  completeChapter: (slug: ChapterSlug, result: ChapterResult) => void;
  completeNineFaces: (score: number) => void;
  unlock: (lead: LeadProfile) => void;
  markFieldReportsSeen: () => void;
  ensureLeaderCode: () => string;
  resetCampaign: () => void;
}

function makeLeaderCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "AOP-";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

const initial = {
  scoutAnswers: {} as Record<string, number>,
  scoutComplete: false,
  provisionalArchetype: null as ArchetypeId | null,
  completedChapters: [] as ChapterSlug[],
  chapterResults: {} as Record<string, ChapterResult>,
  nineFacesComplete: false,
  nineFacesScore: 0,
  unlocked: false,
  lead: null as LeadProfile | null,
  leaderCode: null as string | null,
  fieldReportsSeen: false,
};

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      ...initial,
      setScoutAnswer: (questionId, optionIndex) =>
        set((s) => ({
          scoutAnswers: { ...s.scoutAnswers, [questionId]: optionIndex },
        })),
      completeScout: () => {
        const archetype = scoreArchetype(get().scoutAnswers);
        set({
          scoutComplete: true,
          provisionalArchetype: archetype,
        });
      },
      completeChapter: (slug, result) =>
        set((s) => ({
          completedChapters: s.completedChapters.includes(slug)
            ? s.completedChapters
            : [...s.completedChapters, slug],
          chapterResults: { ...s.chapterResults, [slug]: result },
        })),
      completeNineFaces: (score) =>
        set({ nineFacesComplete: true, nineFacesScore: score }),
      unlock: (lead) =>
        set((s) => ({
          unlocked: true,
          lead,
          leaderCode: s.leaderCode ?? makeLeaderCode(),
        })),
      markFieldReportsSeen: () => set({ fieldReportsSeen: true }),
      ensureLeaderCode: () => {
        const existing = get().leaderCode;
        if (existing) return existing;
        const code = makeLeaderCode();
        set({ leaderCode: code });
        return code;
      },
      resetCampaign: () => set({ ...initial }),
    }),
    { name: "art-of-production-campaign" },
  ),
);

export function requiredProgress(state: {
  completedChapters: ChapterSlug[];
  nineFacesComplete: boolean;
}) {
  const requiredDone = state.completedChapters.filter((s) =>
    REQUIRED_CHAPTER_SLUGS.includes(s),
  ).length;
  const nine = state.nineFacesComplete ? 1 : 0;
  return {
    done: requiredDone + nine,
    total: REQUIRED_CHAPTER_SLUGS.length + 1,
    chaptersDone: requiredDone,
    readyForGate:
      requiredDone >= REQUIRED_CHAPTER_SLUGS.length && state.nineFacesComplete,
  };
}
