import type { ProductionForecast as Forecast } from "@/lib/content";

export function ProductionForecastPanel({
  forecast,
  tone = "parchment",
}: {
  forecast: Forecast;
  tone?: "parchment" | "ink";
}) {
  const ink = tone === "ink";
  const rows = [
    { k: "Most likely risk", v: forecast.risk },
    { k: "Most likely breakthrough", v: forecast.breakthrough },
    { k: "Next 30-day mission", v: forecast.mission30 },
    { k: "Measure", v: forecast.measure },
    { k: "Target", v: forecast.target },
  ];

  return (
    <div
      className={
        ink
          ? "rounded-xl border border-brass/35 bg-brass/10 px-5 py-5"
          : "rounded-xl border border-brass/30 bg-brass/8 px-5 py-5"
      }
    >
      <p
        className={
          ink
            ? "font-ui text-[10px] uppercase tracking-[0.22em] text-brass-bright"
            : "font-ui text-[10px] uppercase tracking-[0.22em] text-brass"
        }
      >
        Production forecast
      </p>
      <p
        className={
          ink
            ? "mt-1 font-body text-xs text-parchment/55"
            : "mt-1 font-body text-xs text-charcoal-soft"
        }
      >
        Diagnosis becomes prescription — not a badge.
      </p>
      <ul className="mt-4 space-y-3">
        {rows.map((r) => (
          <li key={r.k}>
            <p
              className={
                ink
                  ? "font-ui text-[10px] uppercase tracking-[0.16em] text-brass-bright/80"
                  : "font-ui text-[10px] uppercase tracking-[0.16em] text-brass"
              }
            >
              {r.k}
            </p>
            <p
              className={
                ink
                  ? "mt-0.5 font-body text-sm text-parchment/85 leading-relaxed"
                  : "mt-0.5 font-body text-sm text-charcoal leading-relaxed"
              }
            >
              {r.v}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
