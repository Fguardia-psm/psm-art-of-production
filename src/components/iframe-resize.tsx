import { useEffect } from "react";

const MESSAGE_TYPE = "resize-art-of-production";

/** Default allowlist for PSM / HubSpot embeds. Override with VITE_EMBED_PARENT_ORIGINS (comma list). Use * to allow any. */
const DEFAULT_PARENTS = [
  "https://www.psmbrokerage.com",
  "https://psmbrokerage.com",
  "https://www.psm.brokerage",
  "https://psm.brokerage",
];

function allowedParents(): string[] | null {
  const raw = import.meta.env.VITE_EMBED_PARENT_ORIGINS as string | undefined;
  if (raw?.trim() === "*") return null; // explicit unrestricted
  if (raw?.trim()) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return DEFAULT_PARENTS;
}

/**
 * When embedded in an iframe (HubSpot / PSM site), post document height
 * so the parent can size the frame. No-op when not in a frame.
 */
export function IframeResizeReporter() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;

    let raf = 0;
    let last = 0;
    const parents = allowedParents();

    function measure(): number {
      const doc = document.documentElement;
      const body = document.body;
      return Math.max(
        doc?.scrollHeight ?? 0,
        doc?.offsetHeight ?? 0,
        body?.scrollHeight ?? 0,
        body?.offsetHeight ?? 0,
      );
    }

    function sendHeight() {
      const height = measure();
      if (!height || Math.abs(height - last) < 2) return;
      last = height;
      const payload = { type: MESSAGE_TYPE, height };
      if (!parents || parents.length === 0) {
        window.parent.postMessage(payload, "*");
        return;
      }
      const targets = new Set(parents);
      try {
        const ref = document.referrer ? new URL(document.referrer).origin : "";
        if (ref && parents.some((p) => ref === p || ref.endsWith(".hubspot.com") || ref.includes("hs-sites"))) {
          targets.add(ref);
        }
      } catch {
        /* ignore */
      }
      // HubSpot preview / CMS often use *.hubspot.com or hs-sites.com
      for (const origin of targets) {
        try {
          window.parent.postMessage(payload, origin);
        } catch {
          /* cross-origin mismatch — try next */
        }
      }
    }

    function schedule() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sendHeight);
    }

    sendHeight();
    window.addEventListener("load", sendHeight);
    window.addEventListener("resize", schedule);

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    const t1 = window.setTimeout(sendHeight, 500);
    const t2 = window.setTimeout(sendHeight, 1000);
    const t3 = window.setTimeout(sendHeight, 2000);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(schedule)
        : null;
    if (ro) ro.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", sendHeight);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      ro?.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  return null;
}
