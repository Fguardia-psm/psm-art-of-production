import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ArchetypeId,
  BookStage,
  ChapterResult,
  ChapterSlug,
} from "./content";
import { REQUIRED_CHAPTER_SLUGS, scoreArchetype } from "./content";

export const CAMPAIGN_STORAGE_KEY = "art-of-production-campaign";

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
  /** Wipe all campaign progress in memory (persist writes on next tick). */
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

/** Fresh progress payload — never include actions. */
export const EMPTY_CAMPAIGN = {
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
      ...EMPTY_CAMPAIGN,
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
          // Allow re-sealing if chapter is replayed after a soft clear
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
      resetCampaign: () => {
        // Explicit field wipe — avoids accidental action clobber
        set({
          scoutAnswers: {},
          scoutComplete: false,
          provisionalArchetype: null,
          completedChapters: [],
          chapterResults: {},
          nineFacesComplete: false,
          nineFacesScore: 0,
          unlocked: false,
          lead: null,
          leaderCode: null,
          fieldReportsSeen: false,
        });
      },
    }),
    { name: CAMPAIGN_STORAGE_KEY },
  ),
);

/** Any progress worth offering "Start over". */
export function hasCampaignProgress(state: {
  scoutComplete: boolean;
  scoutAnswers: Record<string, number>;
  completedChapters: ChapterSlug[];
  nineFacesComplete: boolean;
  unlocked: boolean;
}): boolean {
  return (
    state.scoutComplete ||
    state.unlocked ||
    state.nineFacesComplete ||
    state.completedChapters.length > 0 ||
    Object.keys(state.scoutAnswers).length > 0
  );
}

/**
 * Hard start-over: memory wipe + localStorage purge + full navigation.
 * Server-side NPN leads cannot be unsent (Deep Truth: say so in UI).
 */
export function startOverCampaign(): void {
  const { resetCampaign } = useCampaignStore.getState();
  resetCampaign();

  try {
    // Nuclear option — persist middleware can lag a tick after set()
    localStorage.removeItem(CAMPAIGN_STORAGE_KEY);
    // Zustand v4/v5 may namespace with a version suffix in some setups
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CAMPAIGN_STORAGE_KEY)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    /* private mode / blocked storage */
  }

  try {
    void useCampaignStore.persist.clearStorage();
  } catch {
    /* no-op */
  }

  // Re-apply empty in case clearStorage rehydrated nothing and left stale
  resetCampaign();

  // Hard navigation beats SPA race (stale components holding old props)
  const url = new URL(window.location.origin);
  url.pathname = "/";
  url.searchParams.set("fresh", String(Date.now()));
  window.location.assign(url.toString());
}

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
