#!/usr/bin/env node
import { mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.APP_URL || "http://127.0.0.1:8080";
const OUT = "/workspace/screenshots/full-site";
mkdirSync(OUT, { recursive: true });

const STORAGE_KEY = "art-of-production-campaign";
const REQUIRED = [
  "quiet-months",
  "without-conflict",
  "choose-ground",
  "command-energy",
  "light-field",
];
const OPTIONAL = ["agency-march", "intelligence"];
const ALL = [...REQUIRED, ...OPTIONAL];

function baseState(overrides = {}) {
  return {
    state: {
      scoutAnswers: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 },
      scoutComplete: true,
      provisionalArchetype: "fire-bearer",
      completedChapters: [],
      chapterResults: {},
      nineFacesComplete: false,
      nineFacesScore: 0,
      unlocked: false,
      lead: null,
      leaderCode: null,
      fieldReportsSeen: false,
      bookStage: "growing",
      ...overrides,
    },
    version: 0,
  };
}

function withChapters(slugs, extra = {}) {
  const results = {};
  for (const s of slugs) results[s] = "victory";
  return baseState({
    completedChapters: slugs,
    chapterResults: results,
    ...extra,
  });
}

async function seed(page, data) {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(
    ({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, data },
  );
  await page.reload({ waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(400);
}

async function shot(page, name) {
  await page.waitForTimeout(900);
  // dismiss any overlay if present
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  const title = await page.title();
  const url = page.url();
  const text = (await page.locator("body").innerText()).slice(0, 80).replace(/\s+/g, " ");
  console.log(JSON.stringify({ name, url, title, text }));
}

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
});

try {
  // Fresh landing
  await seed(page, baseState({
    scoutComplete: false,
    scoutAnswers: {},
    provisionalArchetype: null,
    bookStage: null,
  }));
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await shot(page, "01-landing");

  // Scout Q1
  await page.goto(BASE + "/scout", { waitUntil: "networkidle", timeout: 60000 });
  await shot(page, "02-scout-question");

  // Scout reading (complete + stage)
  await seed(
    page,
    baseState({
      completedChapters: [],
      chapterResults: {},
    }),
  );
  await page.goto(BASE + "/scout", { waitUntil: "networkidle", timeout: 60000 });
  await shot(page, "03-scout-reading");

  // Map mid
  await seed(page, withChapters(["quiet-months", "without-conflict"]));
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
  await shot(page, "04-map");

  // Each chapter: complete all previous required
  let n = 5;
  for (let idx = 0; idx < ALL.length; idx++) {
    const slug = ALL[idx];
    let prior;
    if (REQUIRED.includes(slug)) {
      prior = REQUIRED.slice(0, REQUIRED.indexOf(slug));
    } else {
      prior = [...REQUIRED]; // optional after all required
    }
    await seed(page, withChapters(prior));
    await page.goto(BASE + `/chapter/${slug}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await shot(page, `${String(n).padStart(2, "0")}-chapter-${slug}`);
    n++;
  }

  // Nine faces — all required done
  await seed(page, withChapters([...REQUIRED]));
  await page.goto(BASE + "/nine-faces", { waitUntil: "networkidle", timeout: 60000 });
  await shot(page, "12-nine-faces");

  // Unlock — required + faces, not unlocked
  await seed(
    page,
    withChapters([...REQUIRED], {
      nineFacesComplete: true,
      nineFacesScore: 9,
      unlocked: false,
    }),
  );
  await page.goto(BASE + "/unlock", { waitUntil: "networkidle", timeout: 60000 });
  await shot(page, "13-unlock");

  // Full complete state
  const full = withChapters([...ALL], {
    nineFacesComplete: true,
    nineFacesScore: 9,
    unlocked: true,
    fieldReportsSeen: true,
    leaderCode: "AOP-DEMO01",
    lead: {
      name: "Alex Producer",
      email: "alex@example.com",
      phone: "5125550100",
      npn: "12345678",
      state: "TX",
      bookStage: "growing",
      consented: true,
      submittedAt: new Date().toISOString(),
    },
  });

  await seed(page, full);
  await page.goto(BASE + "/dossier", { waitUntil: "networkidle", timeout: 60000 });
  await shot(page, "14-dossier");

  await page.goto(BASE + "/field-reports", { waitUntil: "networkidle", timeout: 60000 });
  await shot(page, "15-field-reports");

  await page.goto(BASE + "/partner", { waitUntil: "networkidle", timeout: 60000 });
  await shot(page, "16-partner");

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await seed(page, full);
  await page.goto(BASE + "/dossier", { waitUntil: "networkidle", timeout: 60000 });
  await shot(page, "17-dossier-mobile");

  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await shot(page, "18-landing-mobile");

  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
  await shot(page, "19-map-mobile");

  writeFileSync(
    `${OUT}/README.txt`,
    `The Art of Production — full page screenshots
Generated: ${new Date().toISOString()}
Source: local app preview

DESKTOP (1280×900, full page)
01-landing.png
02-scout-question.png
03-scout-reading.png — archetype + exposed flank + mission
04-map.png
05-chapter-quiet-months.png
06-chapter-without-conflict.png
07-chapter-choose-ground.png
08-chapter-command-energy.png
09-chapter-light-field.png
10-chapter-agency-march.png
11-chapter-intelligence.png
12-nine-faces.png
13-unlock.png
14-dossier.png — Field Seal + counsel
15-field-reports.png
16-partner.png

MOBILE (~390×844)
17-dossier-mobile.png
18-landing-mobile.png
19-map-mobile.png
`,
  );

  console.log("files:", readdirSync(OUT).join(", "));
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await browser.close();
}
