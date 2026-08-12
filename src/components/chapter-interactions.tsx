import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ChapterInteraction, ChapterResult } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Check, Compass, Flame, X } from "lucide-react";

export function ChapterInteractionPanel({
  interaction,
  onResolved,
}: {
  interaction: ChapterInteraction;
  onResolved: (result: ChapterResult) => void;
}) {
  if (interaction.type === "prep-storm") {
    return <PrepStorm interaction={interaction} onResolved={onResolved} />;
  }
  if (interaction.type === "objection") {
    return <ObjectionPlay interaction={interaction} onResolved={onResolved} />;
  }
  if (interaction.type === "ground") {
    return <GroundSelect interaction={interaction} onResolved={onResolved} />;
  }
  if (interaction.type === "day-formation") {
    return <DayFormation interaction={interaction} onResolved={onResolved} />;
  }
  if (interaction.type === "fires") {
    return <FiresTend interaction={interaction} onResolved={onResolved} />;
  }
  return <ReflectPick interaction={interaction} onResolved={onResolved} />;
}

/** Night Before AEP — rising storm meter; stack prep on the workbench */
const PREP_STORM_DURATION_MS = 75_000;

function PrepStorm({
  interaction,
  onResolved,
}: {
  interaction: Extract<ChapterInteraction, { type: "prep-storm" }>;
  onResolved: (result: ChapterResult) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<ChapterResult>("lesson");
  const [storm, setStorm] = useState(0);
  const started = true;

  useEffect(() => {
    if (!started || done) return;
    const start = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / PREP_STORM_DURATION_MS) * 100);
      setStorm(pct);
      if (pct >= 100) window.clearInterval(id);
    }, 100);
    return () => window.clearInterval(id);
  }, [started, done]);

  const goodCount = selected.filter((id) =>
    interaction.options.find((o) => o.id === id)?.good,
  ).length;
  const hasBad = selected.some(
    (id) => interaction.options.find((o) => o.id === id)?.good === false,
  );

  function toggle(id: string) {
    if (done) return;
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  }

  function commit() {
    if (done) return;
    let r: ChapterResult = "lesson";
    if (goodCount >= interaction.need && !hasBad) r = "victory";
    else if (goodCount >= interaction.need - 1 || (goodCount >= 2 && hasBad))
      r = "field-note";
    setResult(r);
    setDone(true);
    onResolved(r);
  }

  const text =
    result === "victory"
      ? interaction.success
      : result === "field-note"
        ? interaction.partial
        : interaction.failure;

  return (
    <div className={cn("space-y-5 rounded-xl p-1", "storm-field")}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-ember">
            Field exercise · The night before AEP
          </p>
          <p className="mt-1 font-body text-charcoal">{interaction.prompt}</p>
          {!done ? (
            <p className="mt-2 font-ui text-xs font-medium text-charcoal leading-relaxed">
              Tap the cards below to build your prep list — they work right away.
              Then seal to continue.
            </p>
          ) : null}
        </div>
        {!done ? (
          <p className="font-ui text-xs tabular-nums text-charcoal-soft shrink-0">
            Season pressure {Math.min(100, Math.round(storm))}%
            <span className="block text-[10px] opacity-80">
              {Math.max(
                0,
                Math.ceil(
                  ((PREP_STORM_DURATION_MS * (100 - Math.min(100, storm))) /
                    100) /
                    1000,
                ),
              )}
              s until the season breaks
            </span>
          </p>
        ) : null}
      </div>

      {!done ? (
        <div
          className="h-2 overflow-hidden rounded-full border border-charcoal/10 bg-charcoal/5"
          aria-hidden
        >
          <div
            className="storm-meter h-full rounded-full"
            style={{ width: `${Math.min(100, storm)}%` }}
          />
        </div>
      ) : null}

      <div className="rounded-lg border border-dashed border-brass/35 bg-parchment/50 px-3 py-3">
        <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass mb-2">
          Your prep list · {selected.length} selected
        </p>
        <div className="flex min-h-12 flex-wrap gap-2">
          {selected.length === 0 ? (
            <span className="font-body text-xs text-charcoal-soft">
              Nothing stacked yet — tap the cards below.
            </span>
          ) : (
            selected.map((id) => {
              const opt = interaction.options.find((o) => o.id === id);
              return (
                <span
                  key={id}
                  className="rounded-full border border-brass/30 bg-brass/10 px-3 py-1 font-ui text-xs"
                >
                  {opt?.label}
                </span>
              );
            })
          )}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {interaction.options.map((opt) => {
          const on = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              disabled={done}
              onClick={() => toggle(opt.id)}
              className={cn(
                "rounded-lg border px-4 py-3.5 text-left font-ui text-sm transition-colors min-h-12 cursor-pointer touch-manipulation select-none",
                on
                  ? "border-brass bg-brass/15 text-ink shadow-[0_0_0_1px_rgba(184,148,74,0.35)]"
                  : "border-charcoal/15 bg-parchment hover:border-brass/50 hover:bg-brass/5 active:scale-[0.99]",
                done && "cursor-default opacity-80",
              )}
            >
              <span className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border text-[10px] leading-none",
                    on
                      ? "border-brass bg-brass text-ink"
                      : "border-charcoal/25 text-charcoal/20",
                  )}
                  aria-hidden
                >
                  {on ? "✓" : ""}
                </span>
                <span>{opt.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {!done ? (
        <Button
          type="button"
          variant="paper"
          size="lg"
          className="w-full sm:w-auto min-h-12"
          disabled={goodCount < interaction.need}
          onClick={() => commit()}
        >
          {goodCount < interaction.need
            ? `Select ${interaction.need} prep actions to seal`
            : "Seal preparation · continue"}
        </Button>
      ) : (
        <div className="space-y-3">
          <ResultBanner result={result} text={text} />
          {result !== "victory" ? (
            <div className="rounded-lg border border-brass/30 bg-brass/8 px-4 py-3">
              <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-brass">
                Solid prep ranks · stack these
              </p>
              <ul className="mt-2 space-y-1">
                {interaction.options
                  .filter((o) => o.good)
                  .map((o) => (
                    <li key={o.id} className="font-body text-sm text-charcoal">
                      {o.label}
                    </li>
                  ))}
              </ul>
              <p className="mt-2 font-body text-xs text-charcoal-muted">
                Leave busywork off the workbench (scroll without a plan, “figure
                it out in AEP”).
              </p>
            </div>
          ) : (
            <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-brass animate-seal">
              Prep sealed · carry this into the season
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Multi-select dialogue — pick every move that lowers pressure, then seal */
function ObjectionPlay({
  interaction,
  onResolved,
}: {
  interaction: Extract<ChapterInteraction, { type: "objection" }>;
  onResolved: (result: ChapterResult) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<ChapterResult>("lesson");
  const goodIds = interaction.options
    .filter((o) => o.grade === "victory")
    .map((o) => o.id);
  const need = Math.max(2, goodIds.length);
  const goodPicked = picked.filter((id) => goodIds.includes(id)).length;
  const badPicked = picked.some((id) => {
    const o = interaction.options.find((x) => x.id === id);
    return o?.grade === "lesson";
  });

  function toggle(id: string) {
    if (done) return;
    setPicked((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  }

  function commit() {
    if (done) return;
    let r: ChapterResult = "lesson";
    if (goodPicked >= need && !badPicked) r = "victory";
    else if (goodPicked >= 1) r = "field-note";
    setResult(r);
    setDone(true);
    onResolved(r);
  }

  const pressure = done
    ? result === "victory"
      ? 18
      : result === "field-note"
        ? 52
        : 88
    : 28;

  return (
    <div className="space-y-5">
      <p className="font-body text-charcoal">{interaction.prompt}</p>
      <p className="font-ui text-xs text-charcoal leading-relaxed">
        Select every response that lowers pressure. Need {need}. Then seal.
      </p>

      <div className="rounded-xl border border-charcoal/12 bg-ink text-parchment p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass-bright/80">
            Client at the table
          </p>
          <p className="font-ui text-[10px] tabular-nums text-parchment/50">
            Tension {pressure}%
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-parchment/10">
          <div
            className="h-full rounded-full bg-ember-soft transition-all duration-500"
            style={{ width: `${pressure}%` }}
          />
        </div>
        <blockquote className="mt-4 font-display text-lg italic text-parchment/90 sm:text-xl">
          {interaction.clientLine}
        </blockquote>
      </div>

      <div className="grid gap-2">
        {interaction.options.map((opt) => {
          const on = picked.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              disabled={done}
              onClick={() => toggle(opt.id)}
              aria-pressed={on}
              className={cn(
                "rounded-lg border px-4 py-3 text-left font-ui text-sm transition-colors min-h-11",
                on
                  ? "border-brass bg-brass/15"
                  : "border-charcoal/12 bg-parchment/60 hover:border-brass/40",
                done && !on && "opacity-50",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {!done ? (
        <Button
          variant="paper"
          size="lg"
          disabled={picked.length < need}
          onClick={commit}
        >
          {picked.length < need
            ? `Select at least ${need} responses to seal`
            : "Seal this sit · continue"}
        </Button>
      ) : (
        <div className="space-y-3">
          <ResultBanner
            result={result}
            text={
              result === "victory"
                ? "Pressure falls. The client stays in the chair."
                : result === "field-note"
                  ? "Some trust held. See the responses that lower pressure."
                  : "Pressure rose. See the responses that keep the sit alive."
            }
          />
          {result !== "victory" ? (
            <div className="rounded-lg border border-brass/30 bg-brass/8 px-4 py-3">
              <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-brass">
                Responses that lower pressure
              </p>
              <ul className="mt-2 space-y-1">
                {interaction.options
                  .filter((o) => o.grade === "victory")
                  .map((o) => (
                    <li key={o.id} className="font-body text-sm text-charcoal">
                      {o.label}
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/** Parchment ground map — place banners on fertile tiles */
function GroundSelect({
  interaction,
  onResolved,
}: {
  interaction: Extract<ChapterInteraction, { type: "ground" }>;
  onResolved: (result: ChapterResult) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<ChapterResult>("lesson");

  const fertilePicked = selected.filter(
    (id) => interaction.grounds.find((g) => g.id === id)?.fertile,
  ).length;
  const barrenPicked = selected.filter(
    (id) => interaction.grounds.find((g) => g.id === id)?.fertile === false,
  ).length;

  function toggle(id: string) {
    if (done) return;
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  }

  function commit() {
    let r: ChapterResult = "lesson";
    if (fertilePicked >= interaction.need && barrenPicked === 0) r = "victory";
    else if (fertilePicked >= 2) r = "field-note";
    setResult(r);
    setDone(true);
    onResolved(r);
  }

  return (
    <div className="space-y-5">
      <p className="font-body text-charcoal">{interaction.prompt}</p>
      <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass">
        Plant banners · avoid barren tiles
      </p>
      <p className="font-body text-xs text-charcoal-muted">
        Choose warm ground only — plant banners where trust can begin.
      </p>
      <div className="parchment-map book-chrome grid grid-cols-2 gap-2 rounded-xl p-3 sm:p-4 sm:grid-cols-3">
        {interaction.grounds.map((g) => {
          const on = selected.includes(g.id);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => toggle(g.id)}
              className={cn(
                "relative min-h-[88px] rounded-lg border px-3 py-3 text-left transition-colors",
                on
                  ? g.fertile
                    ? "border-brass bg-brass/15"
                    : "border-ember/50 bg-ember/10"
                  : "border-charcoal/15 bg-parchment/70 hover:border-brass/40",
              )}
            >
              <span className="font-ui text-xs font-medium text-charcoal leading-snug">
                {g.label}
              </span>
              {on ? (
                <span className="mt-2 block font-display text-lg text-brass">
                  ⚑
                </span>
              ) : (
                <span className="mt-2 block font-ui text-[10px] text-charcoal-soft">
                  {g.fertile ? "warm ground" : g.id === "obscurity" ? "no ground" : "barren ground"}
                </span>
              )}
              {done && on ? (
                <span className="mt-1 block font-body text-[11px] text-charcoal-muted leading-snug">
                  {g.note}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {!done ? (
        <Button
          variant="paper"
          size="lg"
          disabled={fertilePicked < interaction.need}
          onClick={commit}
        >
          {fertilePicked < interaction.need
            ? `Plant ${interaction.need} warm-ground banners to claim`
            : "Claim this ground"}
        </Button>
      ) : (
        <div className="space-y-3">
          <ResultBanner
            result={result}
            text={
              result === "victory"
                ? "Opportunity flows to you as water flows downhill. Your ground map is sealed."
                : result === "field-note"
                  ? "Fertile patches found — and barren steps taken. See fertile ground below."
                  : "Poor ground consumes effort. See where trust is already sown."
            }
          />
          {result !== "victory" ? (
            <div className="rounded-lg border border-brass/30 bg-brass/8 px-4 py-3">
              <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-brass">
                Fertile ground · plant banners here
              </p>
              <ul className="mt-2 space-y-1">
                {interaction.grounds
                  .filter((g) => g.fertile)
                  .map((g) => (
                    <li key={g.id} className="font-body text-sm text-charcoal">
                      {g.label}
                      <span className="text-charcoal-muted"> — {g.note}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function DayFormation({
  interaction,
  onResolved,
}: {
  interaction: Extract<ChapterInteraction, { type: "day-formation" }>;
  onResolved: (result: ChapterResult) => void;
}) {
  const [assign, setAssign] = useState<Record<string, string>>({});
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<ChapterResult>("lesson");

  const used = useMemo(() => new Set(Object.values(assign)), [assign]);

  function place(slotId: string) {
    if (done || !activeTask) return;
    setAssign((a) => {
      const next = { ...a };
      for (const k of Object.keys(next)) {
        if (next[k] === activeTask) delete next[k];
      }
      next[slotId] = activeTask;
      return next;
    });
    setActiveTask(null);
  }

  function commit() {
    const correct = interaction.slots.filter(
      (s) => assign[s.id] === s.correct,
    ).length;
    let r: ChapterResult = "lesson";
    if (correct === interaction.slots.length) r = "victory";
    else if (correct >= 2) r = "field-note";
    setResult(r);
    setDone(true);
    onResolved(r);
  }

  const complete = interaction.slots.every((s) => assign[s.id]);

  return (
    <div className="space-y-5">
      <p className="font-body text-charcoal">{interaction.prompt}</p>
      <p className="font-ui text-xs text-charcoal-soft leading-relaxed">
        <span className="font-medium text-charcoal">How to place:</span> tap a
        duty chip, then tap a time of day. Tap a filled slot to replace it.
      </p>
      <div>
        <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass mb-2">
          1 · Choose a duty
        </p>
        <div className="flex flex-wrap gap-2">
          {interaction.tasks.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={done}
              onClick={() => setActiveTask(t.id)}
              className={cn(
                "rounded-full border px-3 py-2.5 font-ui text-xs transition-colors min-h-11",
                activeTask === t.id
                  ? "border-brass bg-brass text-ink"
                  : used.has(t.id)
                    ? "border-charcoal/10 text-charcoal-soft opacity-50"
                    : "border-charcoal/15 bg-parchment hover:border-brass/40",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-brass mb-2">
          2 · Place it on a time of day
          {activeTask
            ? " · ready to place"
            : " · select a duty first"}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {interaction.slots.map((slot) => {
            const taskId = assign[slot.id];
            const task = interaction.tasks.find((t) => t.id === taskId);
            const rightTask = interaction.tasks.find((t) => t.id === slot.correct);
            const correct = done && taskId === slot.correct;
            const wrong = done && taskId && taskId !== slot.correct;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => place(slot.id)}
                disabled={done || (!activeTask && !taskId)}
                className={cn(
                  "min-h-[72px] rounded-lg border px-4 py-3 text-left transition-colors",
                  correct && "border-success/50 bg-success/10",
                  wrong && "border-ember/40 bg-ember/10",
                  !done &&
                    activeTask &&
                    "border-brass/40 bg-brass/5 hover:border-brass",
                  !done &&
                    !activeTask &&
                    "border-charcoal/12 bg-parchment/60",
                )}
              >
                <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-charcoal-soft">
                  {slot.label}
                </span>
                <span className="mt-1 block font-ui text-sm text-charcoal">
                  {task?.label ??
                    (activeTask ? "Tap to place here" : "Waiting for a duty")}
                </span>
                {done && wrong && rightTask ? (
                  <span className="mt-2 block font-ui text-xs text-charcoal leading-snug">
                    <span className="text-ember">Your placement.</span>{" "}
                    <span className="text-success">
                      Correct: {rightTask.label}
                    </span>
                  </span>
                ) : null}
                {done && correct ? (
                  <span className="mt-2 block font-ui text-[10px] uppercase tracking-[0.14em] text-success">
                    Correct placement
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      {!done ? (
        <Button variant="paper" size="lg" disabled={!complete} onClick={commit}>
          {complete ? "Advance the day" : "Place all four duties to continue"}
        </Button>
      ) : (
        <div className="space-y-3">
          <ResultBanner
            result={result}
            text={
              result === "victory"
                ? "Through disciplined movement, labor becomes lighter and the path more direct."
                : result === "field-note"
                  ? interaction.fieldNote
                  : "Motion without strategy leads to exhaustion. See the correct formation below."
            }
          />
          {result !== "victory" ? (
            <div className="rounded-lg border border-brass/30 bg-brass/8 px-4 py-3">
              <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-brass">
                Correct formation · doctrine
              </p>
              <ul className="mt-2 space-y-1.5">
                {interaction.slots.map((slot) => {
                  const right = interaction.tasks.find((t) => t.id === slot.correct);
                  return (
                    <li
                      key={slot.id}
                      className="font-body text-sm text-charcoal leading-snug"
                    >
                      <span className="font-ui text-xs uppercase tracking-[0.12em] text-charcoal-soft">
                        {slot.label}:
                      </span>{" "}
                      {right?.label}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 font-body text-xs text-charcoal-muted leading-relaxed">
                Morning outreach, midday sits, afternoon admin, evening prep —
                one formation, not task-hopping.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/** Night plain — light beacons; protein = channel + measure */
function FiresTend({
  interaction,
  onResolved,
}: {
  interaction: Extract<ChapterInteraction, { type: "fires" }>;
  onResolved: (result: ChapterResult) => void;
}) {
  const [lit, setLit] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<ChapterResult>("lesson");

  function toggle(id: string) {
    if (done) return;
    setLit((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function commit() {
    let r: ChapterResult = "lesson";
    if (lit.length >= interaction.need) r = "victory";
    else if (lit.length >= 2) r = "field-note";
    setResult(r);
    setDone(true);
    onResolved(r);
  }

  const cold = interaction.fires.filter((f) => !lit.includes(f.id));

  return (
    <div className="space-y-5">
      <p className="font-body text-charcoal">{interaction.prompt}</p>
      <p className="font-ui text-xs text-charcoal leading-relaxed">
        <span className="font-medium">What this teaches:</span> cold books stay
        cold. Tap every channel you will actually use this season. Aim for at
        least {interaction.need} fires you will actually tend — measure replies and sits, not
        likes.
      </p>
      <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-brass">
        {done
          ? `${lit.length} of ${interaction.fires.length} lit`
          : `Tap to light · ${lit.length} selected · need ${interaction.need}+`}
      </p>
      <div className="grid gap-2 rounded-xl border border-ink/10 bg-ink p-3 sm:p-4">
        {interaction.fires.map((f) => {
          const on = lit.includes(f.id);
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => toggle(f.id)}
              disabled={done}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors min-h-11 touch-manipulation",
                on
                  ? "border-ember/50 bg-ember/15 beacon-glow text-parchment"
                  : "border-parchment/15 bg-parchment/5 text-parchment/85 hover:border-ember/30",
                done && !on && "opacity-50",
              )}
            >
              <Flame
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  on ? "text-ember-soft" : "text-parchment/40",
                )}
              />
              <span>
                <span className="font-ui text-sm font-medium">{f.label}</span>
                {on || done ? (
                  <span className="mt-1 block font-body text-xs text-parchment/60">
                    {f.note}
                    {on
                      ? " · track: cost → conversations → enrollments"
                      : " · left cold this round"}
                  </span>
                ) : (
                  <span className="mt-1 block font-ui text-[10px] text-parchment/40">
                    Tap to light this channel
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      {!done ? (
        <Button
          variant="ember"
          size="lg"
          disabled={lit.length < interaction.need}
          onClick={commit}
        >
          {lit.length === 0
            ? `Light at least ${interaction.need} fire${interaction.need === 1 ? "" : "s"}`
            : lit.length < interaction.need
              ? `Choose ${interaction.need - lit.length} more (${lit.length}/${interaction.need})`
              : "Tend the blaze · seal fire plan"}
        </Button>
      ) : (
        <div className="space-y-3">
          <ResultBanner
            result={result}
            text={
              result === "victory"
                ? "The ground is no longer cold. Presence before the first call — and every fire has a measure."
                : result === "field-note"
                  ? "A few flames burn — not yet a landscape. Full seasons need multiple channels."
                  : "A single flame warms few. Light more channels before AEP."
            }
          />
          {result !== "victory" && cold.length > 0 ? (
            <div className="rounded-lg border border-brass/30 bg-brass/8 px-4 py-3">
              <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-brass">
                Still cold · consider lighting next
              </p>
              <ul className="mt-2 space-y-1">
                {cold.map((f) => (
                  <li key={f.id} className="font-body text-sm text-charcoal">
                    {f.label}
                    <span className="text-charcoal-muted"> — {f.note}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-body text-xs text-charcoal-muted">
                Doctrine: light at least {interaction.need} fires, and pair each
                with cost → conversations → enrollments.
              </p>
            </div>
          ) : null}
          {result === "victory" ? (
            <p className="font-body text-xs text-charcoal-muted leading-relaxed">
              Carry this Monday: pick one primary fire this week and log replies
              and sits — not vanity metrics.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ReflectPick({
  interaction,
  onResolved,
}: {
  interaction: Extract<ChapterInteraction, { type: "reflect" }>;
  onResolved: (result: ChapterResult) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<ChapterResult>("lesson");
  const badIds = new Set(["hire-fast", "gossip"]);

  function toggle(id: string) {
    if (done) return;
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  }

  function commit() {
    const good = selected.filter((id) => !badIds.has(id)).length;
    const bad = selected.filter((id) => badIds.has(id)).length;
    let r: ChapterResult = "lesson";
    if (good >= interaction.need && bad === 0) r = "victory";
    else if (good >= 2) r = "field-note";
    setResult(r);
    setDone(true);
    onResolved(r);
  }

  return (
    <div className="space-y-5">
      <p className="font-body text-charcoal">{interaction.prompt}</p>
      <div className="grid gap-2">
        {interaction.options.map((o) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              className={cn(
                "rounded-lg border px-4 py-3 text-left transition-colors min-h-11",
                on
                  ? "border-brass bg-brass/10"
                  : "border-charcoal/12 bg-parchment/60 hover:border-brass/40",
              )}
            >
              <span className="font-ui text-sm font-medium text-charcoal">
                {o.label}
              </span>
              {done && on ? (
                <span className="mt-1 block font-body text-xs text-charcoal-muted">
                  {o.note}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {!done ? (
        <Button
          variant="paper"
          size="lg"
          disabled={selected.length === 0}
          onClick={commit}
        >
          Seal this teaching
        </Button>
      ) : (
        <ResultBanner
          result={result}
          text={
            result === "victory"
              ? "Foundations chosen with care. The march can begin without collapse."
              : result === "field-note"
                ? "Some foundations stand — reinforce the rest before you add agents or expand the map."
                : "Ambition without the right foundations becomes chaos. Choose again with discipline."
          }
        />
      )}
    </div>
  );
}

function ResultBanner({
  result,
  text,
}: {
  result: ChapterResult;
  text: string;
}) {
  const label =
    result === "victory"
      ? "Victory seal"
      : result === "field-note"
        ? "Field note"
        : "Lesson";
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-4 animate-fade-up",
        result === "victory"
          ? "border-success/30 bg-success/10"
          : result === "field-note"
            ? "border-brass/30 bg-brass/10"
            : "border-charcoal/15 bg-charcoal/5",
      )}
    >
      <span className="mt-0.5 shrink-0">
        {result === "victory" ? (
          <Check className="size-5 text-success seal-stamp" strokeWidth={2} />
        ) : result === "field-note" ? (
          <Compass className="size-5 text-brass-dim" strokeWidth={2} />
        ) : (
          <X className="size-5 text-charcoal-soft" strokeWidth={2} />
        )}
      </span>
      <div>
        <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-charcoal-muted mb-1">
          {label}
        </p>
        <p className="font-body text-sm leading-relaxed text-charcoal">{text}</p>
      </div>
    </div>
  );
}
