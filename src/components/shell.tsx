import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { requiredProgress, useCampaignStore } from "@/lib/campaign-store";

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

export function CampaignHeader({
  tone = "paper",
}: {
  tone?: "paper" | "ink";
}) {
  const state = useCampaignStore();
  const progress = requiredProgress(state);
  const ink = tone === "ink";

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
        <Link
          to="/"
          className={cn(
            "font-display text-sm title-spaced-wide",
            ink ? "text-parchment/90" : "text-charcoal",
          )}
        >
          The Art of Production
        </Link>
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
                    ? ink
                      ? "border-brass bg-brass"
                      : "border-brass bg-brass"
                    : ink
                      ? "border-parchment/25 bg-transparent"
                      : "border-charcoal/20 bg-transparent",
                )}
              />
            ))}
          </div>
          <span
            className={cn(
              "font-ui text-[11px] tabular-nums tracking-wide",
              ink ? "text-parchment/55" : "text-charcoal-soft",
            )}
          >
            {progress.done}/{progress.total}
          </span>
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
      className={cn(
        "min-h-dvh flex flex-col",
        tone === "ink" ? "ink-wash text-parchment" : "parchment-field text-charcoal",
      )}
    >
      <CampaignHeader tone={tone} />
      <main className={cn("flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12", className)}>
        {children}
      </main>
      <footer
        className={cn(
          "border-t px-4 py-4 text-center",
          tone === "ink" ? "border-parchment/10" : "border-charcoal/10",
        )}
      >
        <AgentOnlyRibbon
          className={tone === "ink" ? "text-parchment/40" : undefined}
        />
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
