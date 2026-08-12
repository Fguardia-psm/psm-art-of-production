#!/usr/bin/env node
/**
 * Paid-readiness + journey smoke against the live preview.
 * Seeds campaign state and walks key pages. Exits 0 if all pass.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.APP_URL || "http://127.0.0.1:8080";
const OUT = "/workspace/screenshots";
mkdirSync(OUT, { recursive: true });

const STORAGE_KEY = "art-of-production-campaign";
const REQUIRED = [
  "quiet-months",
  "without-conflict",
  "choose-ground",
  "command-energy",
  "light-field",
];

function fullState() {
  const results = {};
  for (const s of REQUIRED) results[s] = "victory";
  return {
    state: {
      scoutAnswers: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 },
      scoutComplete: true,
      provisionalArchetype: "fire-bearer",
      completedChapters: [...REQUIRED],
      chapterResults: results,
      nineFacesComplete: true,
      nineFacesScore: 9,
      unlocked: true,
      lead: null,
      leaderCode: "AOP-QA01",
      fieldReportsSeen: true,
      bookStage: "growing",
      counselRequested: false,
      counselRequestedAt: null,
    },
    version: 0,
  };
}

const fails = [];
function assert(cond, msg) {
  if (!cond) fails.push(msg);
}

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e.message || e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

async function seed(data) {
  await page.goto(BASE + "/?utm_source=qa&utm_medium=test&utm_campaign=paid_ready", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.evaluate(
    ({ key, data }) => localStorage.setItem(key, JSON.stringify(data)),
    { key: STORAGE_KEY, data },
  );
}

try {
  await seed({
    state: {
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
      bookStage: null,
      counselRequested: false,
      counselRequestedAt: null,
    },
    version: 0,
  });
  await page.reload({ waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(600);
  const landing = await page.locator("body").innerText();
  assert(/Begin the Campaign/i.test(landing), "landing missing Begin CTA");
  assert(/licensed insurance agents/i.test(landing), "landing missing agent-only trust line");
  assert(!/war council/i.test(landing), "landing has war council");
  assert(!/win the field/i.test(landing), "landing has win the field");
  assert(!/high-protein/i.test(landing), "landing has high-protein");
  await page.screenshot({ path: `${OUT}/qa-landing.png`, fullPage: true });

  await page.goto(BASE + "/scout", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(500);
  const scout = await page.locator("body").innerText();
  assert(/FIELD SCOUT|How do you win/i.test(scout), "scout missing header");
  assert(/Continue|See your reading/i.test(scout), "scout missing Continue");

  await seed(fullState());
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(500);
  const map = await page.locator("body").innerText();
  assert(!/Ready \d/.test(map), "map still shows Ready N score");
  assert(!/high-protein/i.test(map), "map has high-protein");
  assert(/Campaign sealed|Field-ready|Forming|Rising/i.test(map), "map missing status language");
  await page.screenshot({ path: `${OUT}/qa-map.png`, fullPage: true });

  await page.goto(BASE + "/chapter/choose-ground", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForTimeout(500);
  const ground = await page.locator("body").innerText();
  assert(/warm ground/i.test(ground), "chapter III missing warm ground");
  assert(/barren ground|no ground/i.test(ground), "chapter III missing barren/no ground");
  assert(!/open ground/i.test(ground), "chapter III still says open ground");

  await page.goto(BASE + "/chapter/light-field", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForTimeout(500);
  const fires = await page.locator("body").innerText();
  assert(/at least 2 fire|Need 2|two fires/i.test(fires), "chapter V missing 2-fire requirement");
  assert(!/Need 4/i.test(fires), "chapter V still Need 4");

  await page.goto(BASE + "/nine-faces", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(500);
  const faces = await page.locator("body").innerText();
  assert(!/nine languages/i.test(faces), "nine faces still says languages");
  assert(/person in the chair|client types/i.test(faces), "nine faces missing client-type language");

  await page.goto(BASE + "/dossier", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  const dossier = await page.locator("body").innerText();
  assert(/Field Seal|Fire-Bearer|your reading/i.test(dossier), "dossier missing seal/reading");
  assert(/bring my field plan/i.test(dossier), "dossier missing counsel CTA");
  assert(!/Print Field Seal/i.test(dossier), "print still present");
  assert(!/Share seal/i.test(dossier), "share still present");
  assert(!/\bReady \d{2,3}\b/.test(dossier), "dossier still grades Ready N");
  assert(!/Readiness \d+\/100/i.test(dossier), "dossier still grades /100");
  await page.screenshot({ path: `${OUT}/qa-dossier.png`, fullPage: true });

  await page.goto(BASE + "/field-reports", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(500);
  const reports = await page.locator("body").innerText();
  assert(/Fit earns the move/i.test(reports), "field reports missing fit line");
  assert(!/recruiter closes/i.test(reports), "field reports still recruiter closes");

  await page.goto(BASE + "/partner", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(500);
  const partner = await page.locator("body").innerText();
  assert(!/\b63%\b|\b82%\b|\b76%\b/.test(partner), "partner still has fake percents");
  assert(!/exclusive lead vendors/i.test(partner), "partner exclusive lead vendors");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
  );
  assert(!overflow, "mobile landing horizontal overflow");
  await page.screenshot({ path: `${OUT}/qa-landing-mobile.png` });

  const attr = await page.evaluate(() => {
    try {
      return sessionStorage.getItem("aop-paid-attribution");
    } catch {
      return null;
    }
  });
  assert(attr && attr.includes("qa"), "UTM attribution not captured");

  const fatal = errors.filter(
    (e) =>
      !/favicon|ResizeObserver|Failed to load resource/.test(e) &&
      !/net::ERR/.test(e),
  );
  assert(fatal.length === 0, `console errors: ${fatal.slice(0, 5).join(" | ")}`);

  writeFileSync(
    `${OUT}/qa-paid-readiness.json`,
    JSON.stringify({ ok: fails.length === 0, fails, errors: fatal }, null, 2),
  );
} finally {
  await browser.close();
}

if (fails.length) {
  console.error(JSON.stringify({ ok: false, fails }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, pages: "landing scout map ch3 ch5 faces dossier reports partner mobile" }));
process.exit(0);
