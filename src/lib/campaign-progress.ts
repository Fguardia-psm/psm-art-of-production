import {
  REQUIRED_CHAPTERS,
  type ChapterSlug,
} from "./content";

export type ProgressStepId =
  | "scout"
  | ChapterSlug
  | "nine-faces"
  | "field-reports";

export type ProgressStep = {
  id: ProgressStepId;
  label: string;
  done: boolean;
};

export type CampaignProgress = {
  items: ProgressStep[];
  done: number;
  total: number;
  band: "forming" | "rising" | "field-ready" | "campaign-sealed";
  status: "Forming" | "Rising" | "Field-ready" | "Campaign sealed";
  label: string;
};

const CHAPTER_LABEL: Partial<Record<ChapterSlug, string>> = {
  "quiet-months": "Quiet Months",
  "without-conflict": "Without Conflict",
  "choose-ground": "Choose Ground",
  "command-energy": "Command Energy",
  "light-field": "Light the Field",
};

/** Single source of truth for header, map, and dossier Campaign State. */
export function getCampaignProgress(state: {
  scoutComplete: boolean;
  completedChapters: ChapterSlug[];
  nineFacesComplete: boolean;
  fieldReportsSeen: boolean;
}): CampaignProgress {
  const items: ProgressStep[] = [
    { id: "scout", label: "Scout", done: state.scoutComplete },
    ...REQUIRED_CHAPTERS.map((c) => ({
      id: c.slug as ProgressStepId,
      label: CHAPTER_LABEL[c.slug] ?? c.title,
      done: state.completedChapters.includes(c.slug),
    })),
    { id: "nine-faces", label: "Nine Faces", done: state.nineFacesComplete },
    { id: "field-reports", label: "Field Reports", done: state.fieldReportsSeen },
  ];

  const done = items.filter((i) => i.done).length;
  const total = items.length;

  let band: CampaignProgress["band"] = "forming";
  let status: CampaignProgress["status"] = "Forming";
  let label = "Forming — begin the scout";
  if (done >= total) {
    band = "campaign-sealed";
    status = "Campaign sealed";
    label = "Campaign sealed — ready for the field conversation";
  } else if (state.nineFacesComplete) {
    band = "field-ready";
    status = "Field-ready";
    label = "Field-ready — review Field Reports, then counsel";
  } else if (state.scoutComplete && state.completedChapters.length >= 3) {
    band = "rising";
    status = "Rising";
    label = "Rising — seals forming on the map";
  } else if (state.scoutComplete) {
    band = "forming";
    status = "Forming";
    label = "Forming — walk the quiet months";
  }

  return { items, done, total, band, status, label };
}
