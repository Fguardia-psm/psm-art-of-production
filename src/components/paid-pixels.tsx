import { useEffect } from "react";
import { capturePaidAttribution } from "@/lib/paid-attribution";

/**
 * Optional Meta Pixel + LinkedIn Insight. No-op unless env IDs are set.
 * VITE_META_PIXEL_ID
 * VITE_LINKEDIN_PARTNER_ID
 */
export function PaidPixels() {
  useEffect(() => {
    capturePaidAttribution();

    const metaId = (import.meta.env.VITE_META_PIXEL_ID as string | undefined)
      ?.trim();
    const liId = (
      import.meta.env.VITE_LINKEDIN_PARTNER_ID as string | undefined
    )?.trim();

    if (metaId && !document.getElementById("aop-meta-pixel")) {
      const s = document.createElement("script");
      s.id = "aop-meta-pixel";
      s.async = true;
      s.src = "https://connect.facebook.net/en_US/fbevents.js";
      s.onload = () => {
        try {
          window.fbq =
            window.fbq ||
            function (...args: unknown[]) {
              (window.fbq as { q?: unknown[] }).q =
                (window.fbq as { q?: unknown[] }).q || [];
              (window.fbq as { q?: unknown[] }).q!.push(args);
            };
          window.fbq("init", metaId);
          window.fbq("track", "PageView");
        } catch {
          /* ignore */
        }
      };
      document.head.appendChild(s);
    }

    if (liId && !document.getElementById("aop-linkedin-insight")) {
      const s = document.createElement("script");
      s.id = "aop-linkedin-insight";
      s.async = true;
      s.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
      s.onload = () => {
        try {
          window.lintrk =
            window.lintrk ||
            function (...args: unknown[]) {
              (window.lintrk as { q?: unknown[] }).q =
                (window.lintrk as { q?: unknown[] }).q || [];
              (window.lintrk as { q?: unknown[] }).q!.push(args);
            };
          window.lintrk("loader", liId);
        } catch {
          /* ignore */
        }
      };
      document.head.appendChild(s);
    }
  }, []);

  return null;
}
