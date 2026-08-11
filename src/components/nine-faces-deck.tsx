import { useState } from "react";
import { CLIENT_FACES } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ChevronDown, Scroll } from "lucide-react";

/**
 * Read-and-tap face deck for the dossier.
 * Tiles look interactive on purpose — expand for cue, approach, field note.
 */
export function NineFacesDeck({
  score,
}: {
  score?: number;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="rounded-xl border border-charcoal/10 bg-parchment/70 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Scroll className="size-4 shrink-0 text-brass" />
            <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-brass">
              Nine client types
            </p>
          </div>
          <p className="mt-2 font-body text-sm text-charcoal leading-relaxed max-w-xl">
            Same product. Different person in the chair.{" "}
            <span className="font-medium text-charcoal">
              Tap a type for how they show up, what works, what to avoid, and a
              line you can use tomorrow.
            </span>
          </p>
        </div>
        {typeof score === "number" ? (
          <p className="shrink-0 font-ui text-xs tabular-nums text-charcoal-soft">
            Master scene {score}/9
          </p>
        ) : null}
      </div>

      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {CLIENT_FACES.map((f) => {
          const open = openId === f.id;
          return (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : f.id)}
                aria-expanded={open}
                className={cn(
                  "w-full rounded-lg border px-3.5 py-3 text-left transition-colors min-h-11 touch-manipulation",
                  open
                    ? "border-brass bg-brass/10 shadow-[0_0_0_1px_rgba(184,148,74,0.25)]"
                    : "border-charcoal/10 bg-parchment hover:border-brass/40 hover:bg-brass/[0.04]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-ui text-[10px] uppercase tracking-[0.16em] text-brass">
                      {f.name}
                    </p>
                    <p className="mt-1 font-display text-sm italic text-charcoal leading-snug">
                      {f.openingLine}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "mt-0.5 size-4 shrink-0 text-charcoal-soft transition-transform",
                      open && "rotate-180 text-brass",
                    )}
                    aria-hidden
                  />
                </div>

                {open ? (
                  <div className="mt-3 space-y-2 border-t border-charcoal/10 pt-3">
                    <p className="font-body text-xs text-charcoal-muted leading-relaxed">
                      <span className="font-ui text-[10px] uppercase tracking-[0.14em] text-brass">
                        How they show up ·{" "}
                      </span>
                      {f.cue}
                    </p>
                    <p className="font-body text-xs text-charcoal leading-relaxed">
                      <span className="font-ui text-[10px] uppercase tracking-[0.14em] text-brass">
                        What wins ·{" "}
                      </span>
                      {f.approach}
                    </p>
                    <p className="font-body text-xs text-charcoal-muted leading-relaxed">
                      <span className="font-ui text-[10px] uppercase tracking-[0.14em] text-ember">
                        Avoid ·{" "}
                      </span>
                      {f.wrong}
                    </p>
                    <p className="font-body text-xs italic text-charcoal-soft leading-relaxed">
                      Field note: {f.fieldNote}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 font-ui text-[10px] text-charcoal-soft">
                    Tap to open · how they act · what works · what to avoid
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
