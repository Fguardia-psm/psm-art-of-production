#!/usr/bin/env node
/**
 * P0-1: Nine Faces final CTA must land on /dossier on first click.
 */
import { chromium } from "playwright";
import { test, describe } from "node:test";
import assert from "node:assert/strict";

const BASE = process.env.APP_URL || "http://127.0.0.1:8080";
const STORAGE_KEY = "art-of-production-campaign";
const REQUIRED = [
  "quiet-months",
  "without-conflict",
  "choose-ground",
  "command-energy",
  "light-field",
];

function preFacesState() {
  const chapterResults = Object.fromEntries(REQUIRED.map((s) => [s, "victory"]));
  return {
    state: {
      scoutAnswers: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 },
      scoutComplete: true,
      provisionalArchetype: "illuminator",
      completedChapters: [...REQUIRED],
      chapterResults,
      nineFacesComplete: false,
      nineFacesScore: 0,
      unlocked: false,
      lead: null,
      leaderCode: null,
      fieldReportsSeen: false,
      bookStage: "growing",
      counselRequested: false,
      counselRequestedAt: null,
    },
    version: 0,
  };
}

describe("P0-1 dossier nav", () => {
  test("9/9 Finish · enter dossier lands on /dossier", async () => {
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.evaluate(
        ({ key, data }) => localStorage.setItem(key, JSON.stringify(data)),
        { key: STORAGE_KEY, data: preFacesState() },
      );
      await page.goto(BASE + "/nine-faces", {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      await page.waitForTimeout(400);

      for (let i = 0; i < 9; i++) {
        const choice = page.locator("section button").first();
        await choice.click();
        const cta = page.getByTestId(i < 8 ? "next-face" : "enter-dossier");
        await cta.click();
        if (i < 8) await page.waitForTimeout(120);
      }

      await page.waitForURL(/\/dossier/, { timeout: 8000 });
      assert.match(new URL(page.url()).pathname, /\/dossier/);
      await page.waitForSelector("[data-testid=dossier-heading]", { timeout: 8000 });
    } finally {
      await browser.close();
    }
  });
});
