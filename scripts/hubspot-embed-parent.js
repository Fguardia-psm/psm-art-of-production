/**
 * Paste on the HubSpot / psmbrokerage.com page that embeds The Art of Production.
 * Listens for height resize + scroll-to-top when the agent advances screens
 * (Next face, Continue, seal chapter, etc.).
 *
 * Expects an iframe:
 *   <iframe id="art-of-production" src="https://psm-art-of-production.vercel.app/" ...></iframe>
 * Adjust selector if needed.
 */
(function () {
  var IFRAME_SELECTOR =
    'iframe[src*="psm-art-of-production"], iframe#art-of-production, iframe[src*="art-of-production"]';

  function findFrame() {
    return document.querySelector(IFRAME_SELECTOR);
  }

  function scrollFrameIntoView(frame) {
    if (!frame) return;
    try {
      frame.scrollIntoView({ behavior: "auto", block: "start" });
    } catch (e) {
      try {
        frame.scrollIntoView(true);
      } catch (e2) {
        /* ignore */
      }
    }
    // Also pin the window to the iframe top offset
    try {
      var rect = frame.getBoundingClientRect();
      var y = window.pageYOffset + rect.top - 8;
      window.scrollTo(0, Math.max(0, y));
    } catch (e3) {
      /* ignore */
    }
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || typeof data !== "object") return;

    var frame = findFrame();
    if (!frame) return;

    if (data.type === "resize-art-of-production" && typeof data.height === "number") {
      frame.style.height = Math.ceil(data.height) + "px";
      if (data.scrollToTop) scrollFrameIntoView(frame);
    }

    if (data.type === "scroll-art-of-production") {
      scrollFrameIntoView(frame);
    }
  });
})();
