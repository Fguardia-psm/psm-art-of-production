/**
 * Funnel analytics — works without webhook.
 * - Pushes to window.dataLayer (GTM) if present
 * - Dispatches CustomEvent for embed hosts
 * - Optional VITE_ANALYTICS_ENDPOINT POST (beacon)
 * - Keeps a short local ring buffer for debug (no PII)
 */

export type FunnelEvent =
  | "campaign_start"
  | "scout_complete"
  | "stage_selected"
  | "chapter_seal"
  | "faces_complete"
  | "dossier_view"
  | "field_report_open"
  | "counsel_click"
  | "field_seal_print"
  | "field_seal_share"
  | "map_view"
  | "start_over";

type Props = Record<string, string | number | boolean | null | undefined>;

const BUFFER_KEY = "aop-funnel-buffer";
const MAX_BUFFER = 40;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
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
    window.dispatchEvent(
      new CustomEvent("aop-funnel", { detail: payload }),
    );
  } catch {
    /* ignore */
  }

  pushBuffer(payload);

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined;
  if (endpoint?.trim()) {
    try {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
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

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info("[aop-funnel]", event, props);
  }
}
