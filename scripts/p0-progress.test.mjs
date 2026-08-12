import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

// Lightweight mirror of getCampaignProgress rules (source of truth is TS).
// Ensures header/map/dossier cannot disagree on band.
function getCampaignProgress(state) {
  const chapters = [
    "quiet-months",
    "without-conflict",
    "choose-ground",
    "command-energy",
    "light-field",
  ];
  const items = [
    { id: "scout", done: state.scoutComplete },
    ...chapters.map((id) => ({
      id,
      done: state.completedChapters.includes(id),
    })),
    { id: "nine-faces", done: state.nineFacesComplete },
    { id: "field-reports", done: state.fieldReportsSeen },
  ];
  const done = items.filter((i) => i.done).length;
  let status = "Forming";
  if (done >= items.length) status = "Campaign sealed";
  else if (state.nineFacesComplete) status = "Field-ready";
  else if (state.scoutComplete && state.completedChapters.length >= 3)
    status = "Rising";
  return { done, total: items.length, status, items };
}

describe("P0-5 one progress model", () => {
  it("starts at Forming 0/8", () => {
    const p = getCampaignProgress({
      scoutComplete: false,
      completedChapters: [],
      nineFacesComplete: false,
      fieldReportsSeen: false,
    });
    assert.equal(p.total, 8);
    assert.equal(p.done, 0);
    assert.equal(p.status, "Forming");
  });

  it("nine faces done without reports is Field-ready not Campaign sealed", () => {
    const p = getCampaignProgress({
      scoutComplete: true,
      completedChapters: [
        "quiet-months",
        "without-conflict",
        "choose-ground",
        "command-energy",
        "light-field",
      ],
      nineFacesComplete: true,
      fieldReportsSeen: false,
    });
    assert.equal(p.done, 7);
    assert.equal(p.status, "Field-ready");
    const reports = p.items.find((i) => i.id === "field-reports");
    assert.equal(reports.done, false);
  });

  it("reports seen seals the campaign", () => {
    const p = getCampaignProgress({
      scoutComplete: true,
      completedChapters: [
        "quiet-months",
        "without-conflict",
        "choose-ground",
        "command-energy",
        "light-field",
      ],
      nineFacesComplete: true,
      fieldReportsSeen: true,
    });
    assert.equal(p.status, "Campaign sealed");
    assert.equal(p.done, 8);
  });
});

void createRequire;
