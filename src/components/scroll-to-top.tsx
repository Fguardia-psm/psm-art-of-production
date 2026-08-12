import { useEffect, useLayoutEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const SCROLL_MSG = "scroll-art-of-production";
const RESIZE_MSG = "resize-art-of-production";

const DEFAULT_PARENTS = [
  "https://www.psmbrokerage.com",
  "https://psmbrokerage.com",
  "https://www.psm.brokerage",
  "https://psm.brokerage",
];

function parentOrigins(): string[] {
  const raw = import.meta.env.VITE_EMBED_PARENT_ORIGINS as string | undefined;
  if (raw?.trim() === "*") return ["*"];
  if (raw?.trim()) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const list = [...DEFAULT_PARENTS];
  try {
    const ref = document.referrer ? new URL(document.referrer).origin : "";
    if (
      ref &&
      (list.includes(ref) ||
        ref.endsWith(".hubspot.com") ||
        ref.includes("hs-sites"))
    ) {
      list.push(ref);
    }
  } catch {
    /* ignore */
  }
  return list;
}

function notifyParentScrollTop() {
  if (typeof window === "undefined" || window.parent === window) return;
  const height = Math.max(
    document.documentElement?.scrollHeight ?? 0,
    document.body?.scrollHeight ?? 0,
  );
  const payloads = [
    { type: SCROLL_MSG, top: 0, scrollIntoView: true },
    { type: RESIZE_MSG, height, scrollToTop: true },
  ];
  const origins = parentOrigins();
  for (const payload of payloads) {
    if (origins.includes("*")) {
      try {
        window.parent.postMessage(payload, "*");
      } catch {
        /* ignore */
      }
      continue;
    }
    for (const origin of origins) {
      try {
        window.parent.postMessage(payload, origin);
      } catch {
        /* ignore */
      }
    }
  }
}

/** Scroll every possible surface: window, html/body, nested roots, embed parent. */
export function scrollToTopOfCampaign() {
  if (typeof window === "undefined") return;

  const go = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch {
      window.scrollTo(0, 0);
    }

    const se = document.scrollingElement;
    if (se) se.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    document
      .querySelectorAll(
        "[data-scroll-root], [data-campaign-shell], main, #root, #app, .overflow-y-auto, .overflow-auto",
      )
      .forEach((el) => {
        if (el instanceof HTMLElement) el.scrollTop = 0;
      });

    // Walk offset parents / overflow ancestors of the campaign root
    const root =
      document.querySelector("[data-campaign-shell]") ?? document.body;
    let node: HTMLElement | null =
      root instanceof HTMLElement ? root : document.body;
    while (node) {
      try {
        if (node.scrollTop) node.scrollTop = 0;
      } catch {
        /* ignore */
      }
      node = node.parentElement;
    }

    notifyParentScrollTop();
  };

  go();
  // Multiple passes: layout, fonts, iframe height resize
  requestAnimationFrame(go);
  window.setTimeout(go, 0);
  window.setTimeout(go, 50);
  window.setTimeout(go, 150);
  window.setTimeout(go, 400);
}

function scrollWindowTop() {
  scrollToTopOfCampaign();
}

/**
 * Force top of page on every route change (Next chapter, map links, etc.).
 * scrollRestoration alone can leave users mid-page in SPA / iframe embeds.
 */
export function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const href = useRouterState({ select: (s) => s.location.href });

  useLayoutEffect(() => {
    scrollToTopOfCampaign();
  }, [pathname, href]);

  useEffect(() => {
    scrollToTopOfCampaign();
  }, [pathname, href]);

  return null;
}

/** Call when advancing steps on the same route (scout questions, Nine Faces). */
export function useScrollToTopOnChange(key: string | number) {
  useLayoutEffect(() => {
    scrollToTopOfCampaign();
  }, [key]);

  useEffect(() => {
    scrollToTopOfCampaign();
  }, [key]);
}

// useEffect fallback for environments where layout effect is flaky
export function useScrollTopEffect(key: string | number) {
  useEffect(() => {
    scrollToTopOfCampaign();
  }, [key]);
}
