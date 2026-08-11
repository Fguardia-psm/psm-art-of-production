/**
 * Print only the Field Seal as a single letter page.
 * Opens a dedicated print document so HubSpot/parent chrome never prints.
 */
export function printFieldSeal(element: HTMLElement | null) {
  if (!element || typeof window === "undefined") return;

  const styles = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style'),
  )
    .map((node) => {
      if (node instanceof HTMLLinkElement) {
        return `<link rel="stylesheet" href="${node.href}" />`;
      }
      if (node instanceof HTMLStyleElement) {
        return `<style>${node.innerHTML}</style>`;
      }
      return "";
    })
    .join("\n");

  const markup = element.outerHTML;
  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=1200");
  if (!win) {
    // Popup blocked — fall back to class-based same-window print
    document.documentElement.classList.add("printing-field-seal");
    const cleanup = () => {
      document.documentElement.classList.remove("printing-field-seal");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    return;
  }

  win.document.open();
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Field Seal · The Art of Production</title>
  ${styles}
  <style>
    @page { size: letter portrait; margin: 0.4in; }
    html, body {
      margin: 0;
      padding: 0;
      background: #f5f0e6 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 0;
    }
    #field-card {
      width: 100%;
      max-width: 7.5in;
      box-shadow: none !important;
      border-radius: 0 !important;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .print\\:hidden, .print-compact-hide { display: none !important; }
    @media print {
      body { background: white !important; padding: 0; }
      #field-card { max-width: none; border: 1.5pt solid #8a7340 !important; }
      #field-card .relative.px-5 { padding: 0.3in 0.35in !important; }
      #field-card h2 { font-size: 26pt !important; line-height: 0.95 !important; }
      #field-card .mt-5 { margin-top: 0.32rem !important; }
      #field-card .field-card-seal { transform: none !important; width: 4rem !important; height: 4rem !important; }
    }
  </style>
</head>
<body>
  ${markup}
  <script>
    window.onload = function () {
      setTimeout(function () {
        window.focus();
        window.print();
      }, 250);
    };
    window.onafterprint = function () {
      window.close();
    };
  <\/script>
</body>
</html>`);
  win.document.close();
}
