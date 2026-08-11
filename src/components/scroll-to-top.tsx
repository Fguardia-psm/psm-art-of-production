import { useEffect, useLayoutEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

function scrollWindowTop() {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" in window ? "instant" : "auto" });
  } catch {
    window.scrollTo(0, 0);
  }
  // Defensive: some browsers / iframe hosts keep offset on html/body
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  // Campaign shell / app roots if they ever scroll internally
  document
    .querySelectorAll("[data-scroll-root], main, #root, [data-campaign-shell]")
    .forEach((el) => {
      if (el instanceof HTMLElement) el.scrollTop = 0;
    });
}

/**
 * Force top of page on every route change (Next chapter, map links, etc.).
 * scrollRestoration alone can leave users mid-page in SPA / iframe embeds.
 */
export function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const href = useRouterState({ select: (s) => s.location.href });

  useLayoutEffect(() => {
    scrollWindowTop();
    // After paint / fonts / images reflow
    const t1 = window.setTimeout(scrollWindowTop, 0);
    const t2 = window.setTimeout(scrollWindowTop, 50);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname, href]);

  return null;
}

/** Call when advancing steps on the same route (scout questions, Nine Faces). */
export function useScrollToTopOnChange(key: string | number) {
  useLayoutEffect(() => {
    scrollWindowTop();
    const t = window.setTimeout(scrollWindowTop, 0);
    return () => window.clearTimeout(t);
  }, [key]);
}

// useEffect fallback for environments where layout effect is flaky
export function useScrollTopEffect(key: string | number) {
  useEffect(() => {
    scrollWindowTop();
  }, [key]);
}
