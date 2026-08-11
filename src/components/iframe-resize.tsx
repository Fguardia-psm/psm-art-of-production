import { useEffect } from "react";

const MESSAGE_TYPE = "resize-art-of-production";

/**
 * When embedded in an iframe (HubSpot / PSM site), post document height
 * so the parent can size the frame. No-op when not in a frame.
 */
export function IframeResizeReporter() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only talk to parent when we are actually embedded
    if (window.parent === window) return;

    let raf = 0;
    let last = 0;

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
      window.parent.postMessage({ type: MESSAGE_TYPE, height }, "*");
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

    // Catch late layout (fonts, images, route transitions)
    const t1 = window.setTimeout(sendHeight, 500);
    const t2 = window.setTimeout(sendHeight, 1000);
    const t3 = window.setTimeout(sendHeight, 2000);

    // Route / SPA navigations change height without full load
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
