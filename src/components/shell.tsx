import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  hasCampaignProgress,
  requiredProgress,
  useCampaignStore,
} from "@/lib/campaign-store";
import { computeReadiness } from "@/lib/readiness";
import { StartOverControl } from "@/components/start-over";

export function AgentOnlyRibbon({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "font-ui text-[10px] uppercase tracking-[0.22em] text-charcoal-soft",
        className,
      )}
    >
      For Agent Use Only · PSM Brokerage
    </p>
  );
}

function seasonLine(done: number, total: number) {
  if (done <= 0) return "The land is still quiet…";
  if (done < 3) return "Preparation forges the season…";
  if (done < total - 1) return "The campaign advances…";
  if (done < total) return "The Nine Faces await…";
  return "The field is marked. Proof remains…";
}

export function CampaignHeader({
  tone = "paper",
}: {
  tone?: "paper" | "ink";
}) {
  const state = useCampaignStore();
  const progress = requiredProgress(state);
  const readiness = computeReadiness(state);
  const ink = tone === "ink";
  const canReset = hasCampaignProgress(state);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-md",
        ink
          ? "border-parchment/10 bg-ink/90 text-parchment"
          : "border-charcoal/10 bg-parchment/90 text-charcoal",
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <Link
            to="/"
            className={cn(
              "font-display text-sm title-spaced-wide",
              ink ? "text-parchment/90" : "text-charcoal",
            )}
          >
            The Art of Production
          </Link>
          <p
            className={cn(
              "mt-0.5 truncate font-ui text-[10px] tracking-wide",
              ink ? "text-parchment/40" : "text-charcoal-soft",
            )}
          >
            {seasonLine(progress.done, progress.total)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="hidden items-center gap-2 sm:flex"
            aria-label={`Progress ${progress.done} of ${progress.total}`}
          >
            {Array.from({ length: progress.total }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-2 rounded-full border transition-colors",
                  i < progress.done
                    ? "border-brass bg-brass"
                    : ink
                      ? "border-parchment/25 bg-transparent"
                      : "border-charcoal/20 bg-transparent",
                )}
              />
            ))}
          </div>
          <div className="text-right">
            <span
              className={cn(
                "font-ui text-[11px] tabular-nums tracking-wide",
                ink ? "text-parchment/55" : "text-charcoal-soft",
              )}
            >
              {progress.done}/{progress.total}
            </span>
            {state.scoutComplete ? (
              <p
                className={cn(
                  "font-ui text-[10px]",
                  ink ? "text-brass-bright/70" : "text-brass",
                )}
                title={readiness.label}
              >
                {readiness.band === "campaign-sealed"
                  ? "Campaign sealed"
                  : readiness.band === "field-ready"
                    ? "Field-ready"
                    : readiness.band === "ready"
                      ? "Rising"
                      : "Forming"}
              </p>
            ) : null}
            {canReset ? (
              <div className="mt-0.5">
                <StartOverControl
                  variant="header"
                  className={
                    ink
                      ? "text-parchment/45 hover:text-parchment/80"
                      : "text-charcoal-soft hover:text-charcoal"
                  }
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export function CampaignShell({
  children,
  tone = "paper",
  className,
}: {
  children: React.ReactNode;
  tone?: "paper" | "ink";
  className?: string;
}) {
  return (
    <div
      data-campaign-shell
      className={cn(
        "min-h-dvh flex flex-col",
        tone === "ink" ? "ink-wash text-parchment" : "parchment-field text-charcoal",
      )}
    >
      <CampaignHeader tone={tone} />
      <main
        className={cn(
          "flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12",
          className,
        )}
      >
        <div
          className={cn(
            tone === "paper" &&
              "book-chrome rounded-xl bg-parchment/40 px-4 py-6 sm:px-8 sm:py-8",
          )}
        >
          {children}
        </div>
      </main>
      <footer
        className={cn(
          "border-t px-4 py-5 text-center space-y-2.5",
          tone === "ink" ? "border-parchment/10" : "border-charcoal/10",
        )}
      >
        <AgentOnlyRibbon
          className={tone === "ink" ? "text-parchment/40" : undefined}
        />
        <p
          className={cn(
            "mx-auto max-w-md font-body text-[11px] leading-relaxed",
            tone === "ink" ? "text-parchment/35" : "text-charcoal-soft",
          )}
        >
          Your progress saves on this device only. Requesting counsel sends
          your field brief to PSM so the follow-up starts with context.
        </p>
        <p
          className={cn(
            "font-ui text-[10px] tracking-wide",
            tone === "ink" ? "text-parchment/30" : "text-charcoal-soft",
          )}
        >
          <a
            href="https://www.psmbrokerage.com/privacy-policy"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:opacity-80"
          >
            Privacy
          </a>
          <span className="mx-2 opacity-40">·</span>
          <a
            href="https://www.psmbrokerage.com/contact"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:opacity-80"
          >
            Contact
          </a>
          <span className="mx-2 opacity-40">·</span>
          PSM Brokerage
        </p>
        <div
          className={cn(
            "flex justify-center",
            tone === "ink" && "[&_button]:text-parchment/45 [&_button]:hover:text-parchment/80",
          )}
        >
          <StartOverControl
            variant="inline"
            className={
              tone === "ink"
                ? "text-parchment/45 hover:text-parchment/80"
                : undefined
            }
          />
        </div>
      </footer>
    </div>
  );
}

export function SectionKicker({
  children,
  ink,
}: {
  children: React.ReactNode;
  ink?: boolean;
}) {
  return (
    <p
      className={cn(
        "font-ui text-[11px] uppercase tracking-[0.28em]",
        ink ? "text-brass-bright/90" : "text-brass",
      )}
    >
      {children}
    </p>
  );
}

export function QuotePlate({
  quote,
  sub,
  className,
}: {
  quote: string;
  sub?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "ink-wash rounded-xl border border-parchment/10 px-6 py-10 text-center shadow-[var(--shadow-plate)] sm:px-10 sm:py-14",
        className,
      )}
    >
      <blockquote className="font-display text-2xl leading-snug text-parchment sm:text-3xl animate-ink-in">
        “{quote}”
      </blockquote>
      {sub ? (
        <figcaption className="mt-6 font-body text-sm text-parchment/65 animate-fade-up">
          {sub}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function MarkWell({ children }: { children: React.ReactNode }) {
  return (
    <aside className="rounded-lg border border-brass/30 bg-brass/8 px-5 py-4">
      <p className="font-ui text-[10px] uppercase tracking-[0.24em] text-brass mb-2">
        Mark this well
      </p>
      <p className="font-body text-base text-charcoal leading-relaxed">{children}</p>
    </aside>
  );
}

export function ReadinessPlate({
  score,
  label,
  parts,
  band,
}: {
  score: number;
  label: string;
  parts: { label: string; pts: number; max: number }[];
  band?: string;
}) {
  const status =
    band === "campaign-sealed"
      ? "Campaign sealed"
      : band === "field-ready"
        ? "Field-ready"
        : band === "ready"
          ? "Rising"
          : "Forming";
  return (
    <div className="rounded-xl border border-charcoal/10 bg-parchment/70 p-5">
      <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
        Campaign state · before talking with a field leader
      </p>
      <p className="mt-2 font-display text-3xl text-charcoal">{status}</p>
      <p className="mt-1 font-body text-sm text-charcoal-muted">{label}</p>
      <ul className="mt-4 space-y-2">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center justify-between gap-3">
            <span className="font-ui text-xs text-charcoal-soft">{p.label}</span>
            <span className="font-ui text-xs text-charcoal">
              {p.pts >= p.max ? "Complete" : p.pts > 0 ? "In progress" : "Not started"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
