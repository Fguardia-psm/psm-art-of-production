/**
 * Funnel analytics — works without webhook.
 * - Pushes to window.dataLayer (GTM) if present
 * - Dispatches CustomEvent for embed hosts
 * - Optional VITE_ANALYTICS_ENDPOINT POST (beacon)
 * - Optional Meta Pixel / LinkedIn Insight (env IDs)
 * - Attaches first-touch UTMs
 * - Keeps a short local ring buffer for debug (no PII)
 */

import { attributionAsProps } from "@/lib/paid-attribution";

export type FunnelEvent =
  | "campaign_start"
  | "scout_complete"
  | "stage_selected"
  | "chapter_seal"
  | "faces_complete"
  | "dossier_view"
  | "field_report_open"
  | "counsel_click"
  | "map_view"
  | "start_over";

type Props = Record<string, string | number | boolean | null | undefined>;

const BUFFER_KEY = "aop-funnel-buffer";
const MAX_BUFFER = 40;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
    lintrk?: (...args: unknown[]) => void;
  }
}

function pushBuffer(entry: Record<string, unknown>) {
  try {
    const raw = sessionStorage.getItem(BUFFER_KEY);
    const list: unknown[] = raw ? JSON.parse(raw) : [];
    list.push(entry);
    while (list.length > MAX_BUFFER) list.shift();
    sessionStorage.setItem(BUFFER_KEY, JSON.stringify(list));
  } catch {
    /* private mode */
  }
}

export function track(event: FunnelEvent, props: Props = {}) {
  if (typeof window === "undefined") return;

  const payload = {
    event,
    event_source: "art_of_production",
    ts: new Date().toISOString(),
    path: window.location.pathname,
    ...attributionAsProps(),
    ...Object.fromEntries(
      Object.entries(props).filter(([, v]) => v !== undefined && v !== null),
    ),
  };

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  } catch {
    /* ignore */
  }

  try {
    window.dispatchEvent(new CustomEvent("aop-funnel", { detail: payload }));
  } catch {
    /* ignore */
  }

  pushBuffer(payload);

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined;
  if (endpoint?.trim()) {
    try {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          endpoint,
          new Blob([body], { type: "application/json" }),
        );
      } else {
        void fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        });
      }
    } catch {
      /* ignore */
    }
  }

  try {
    if (typeof window.fbq === "function") {
      if (event === "counsel_click")
        window.fbq("track", "Lead", { content_name: "counsel" });
      else if (event === "campaign_start")
        window.fbq("track", "ViewContent", { content_name: "campaign_start" });
      else if (event === "scout_complete")
        window.fbq("trackCustom", "ScoutComplete");
      else if (event === "dossier_view")
        window.fbq("trackCustom", "DossierView");
    }
    if (typeof window.lintrk === "function" && event === "counsel_click") {
      const conv = import.meta.env.VITE_LINKEDIN_CONVERSION_ID as
        | string
        | undefined;
      if (conv) window.lintrk("track", { conversion_id: conv });
    }
  } catch {
    /* pixels optional */
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info("[aop-funnel]", event, props);
  }
}
