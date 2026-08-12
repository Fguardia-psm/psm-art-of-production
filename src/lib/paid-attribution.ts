/**
 * Paid-ad attribution — capture UTMs / click IDs once, persist on this device,
 * attach to counsel webhook + analytics. No PII.
 */

const KEY = "aop-paid-attribution";

const PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ad_id",
  "adset_id",
  "campaign_id",
  "fbclid",
  "li_fat_id",
  "gclid",
] as const;

export type PaidAttribution = Partial<Record<(typeof PARAMS)[number], string>>;

function readStored(): PaidAttribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PaidAttribution;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStored(data: PaidAttribution) {
  try {
    const json = JSON.stringify(data);
    sessionStorage.setItem(KEY, json);
    localStorage.setItem(KEY, json);
  } catch {
    /* private mode */
  }
}

/** Call once on landing / any route — first-touch wins. */
export function capturePaidAttribution(): PaidAttribution {
  if (typeof window === "undefined") return {};
  const existing = readStored();
  const next: PaidAttribution = { ...existing };
  const params = new URLSearchParams(window.location.search);
  let changed = false;
  for (const key of PARAMS) {
    const v = params.get(key)?.trim();
    if (v && !next[key]) {
      next[key] = v.slice(0, 200);
      changed = true;
    }
  }
  if (changed) writeStored(next);
  return next;
}

export function getPaidAttribution(): PaidAttribution {
  return capturePaidAttribution();
}

export function attributionAsProps(): Record<string, string> {
  const a = getPaidAttribution();
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(a)) {
    if (v) out[k] = v;
  }
  return out;
}
