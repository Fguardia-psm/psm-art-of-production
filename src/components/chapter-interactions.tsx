import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ChapterInteraction, ChapterResult } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Check, Compass, X } from "lucide-react";

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
    <div className="space-y-5">
      <p className="font-body text-charcoal">{interaction.prompt}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {interaction.options.map((opt) => {
          const on = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={cn(
                "rounded-lg border px-4 py-3 text-left font-ui text-sm transition-colors min-h-11",
                on
                  ? "border-brass bg-brass/10 text-ink"
                  : "border-charcoal/12 bg-parchment/60 hover:border-brass/40",
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
          disabled={selected.length === 0}
          onClick={commit}
        >
          Face the storm
        </Button>
      ) : (
        <ResultBanner result={result} text={text} />
      )}
    </div>
  );
}

function ObjectionPlay({
  interaction,
  onResolved,
}: {
  interaction: Extract<ChapterInteraction, { type: "objection" }>;
  onResolved: (result: ChapterResult) => void;
}) {
  const [pick, setPick] = useState<string | null>(null);
  const chosen = interaction.options.find((o) => o.id === pick);

  return (
    <div className="space-y-5">
      <p className="font-body text-charcoal">{interaction.prompt}</p>
      <blockquote className="rounded-lg border border-charcoal/10 bg-ink/5 px-4 py-3 font-display text-lg italic text-charcoal">
        {interaction.clientLine}
      </blockquote>
      <div className="grid gap-2">
        {interaction.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={!!pick}
            onClick={() => {
              setPick(opt.id);
              onResolved(opt.grade);
            }}
            className={cn(
              "rounded-lg border px-4 py-3 text-left font-ui text-sm transition-colors min-h-11",
              pick === opt.id
                ? opt.grade === "victory"
                  ? "border-success/50 bg-success/10"
                  : opt.grade === "field-note"
                    ? "border-brass/40 bg-brass/10"
                    : "border-ember/40 bg-ember/10"
                : "border-charcoal/12 bg-parchment/60 hover:border-brass/40",
              pick && pick !== opt.id && "opacity-50",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {chosen ? (
        <ResultBanner result={chosen.grade} text={chosen.reveal} />
      ) : null}
    </div>
  );
}

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
      <div className="grid gap-2 sm:grid-cols-2">
        {interaction.grounds.map((g) => {
          const on = selected.includes(g.id);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => toggle(g.id)}
              className={cn(
                "rounded-lg border px-4 py-3 text-left transition-colors min-h-11",
                on
                  ? "border-brass bg-brass/10"
                  : "border-charcoal/12 bg-parchment/60 hover:border-brass/40",
              )}
            >
              <span className="font-ui text-sm font-medium text-charcoal">
                {g.label}
              </span>
              {done && on ? (
                <span className="mt-1 block font-body text-xs text-charcoal-muted">
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
          disabled={selected.length === 0}
          onClick={commit}
        >
          Claim this ground
        </Button>
      ) : (
        <ResultBanner
          result={result}
          text={
            result === "victory"
              ? "Opportunity flows to you as water flows downhill. You no longer chase — prospects seek you out."
              : result === "field-note"
                ? "You found fertile patches — and still stepped on barren ground. Reposition where trust is already sown."
                : "Poor ground consumes effort. Stand where eyes naturally fall."
          }
        />
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
      <div className="flex flex-wrap gap-2">
        {interaction.tasks.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={done || (used.has(t.id) && activeTask !== t.id)}
            onClick={() => setActiveTask(t.id)}
            className={cn(
              "rounded-full border px-3 py-2 font-ui text-xs transition-colors min-h-11",
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
      <div className="grid gap-2 sm:grid-cols-2">
        {interaction.slots.map((slot) => {
          const taskId = assign[slot.id];
          const task = interaction.tasks.find((t) => t.id === taskId);
          const correct = done && taskId === slot.correct;
          const wrong = done && taskId && taskId !== slot.correct;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => place(slot.id)}
              className={cn(
                "min-h-[72px] rounded-lg border px-4 py-3 text-left transition-colors",
                correct && "border-success/50 bg-success/10",
                wrong && "border-ember/40 bg-ember/10",
                !done &&
                  "border-charcoal/12 bg-parchment/60 hover:border-brass/40",
              )}
            >
              <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-charcoal-soft">
                {slot.label}
              </span>
              <span className="mt-1 block font-ui text-sm text-charcoal">
                {task?.label ?? (activeTask ? "Place here" : "Select a duty")}
              </span>
            </button>
          );
        })}
      </div>
      {!done ? (
        <Button variant="paper" size="lg" disabled={!complete} onClick={commit}>
          Advance the day
        </Button>
      ) : (
        <ResultBanner
          result={result}
          text={
            result === "victory"
              ? "Through disciplined movement, labor becomes lighter and the path more direct."
              : result === "field-note"
                ? interaction.fieldNote
                : "Motion without strategy leads to exhaustion. Reorder the stones and advance with purpose."
          }
        />
      )}
    </div>
  );
}

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

  return (
    <div className="space-y-5">
      <p className="font-body text-charcoal">{interaction.prompt}</p>
      <div className="grid gap-2">
        {interaction.fires.map((f) => {
          const on = lit.includes(f.id);
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => toggle(f.id)}
              className={cn(
                "rounded-lg border px-4 py-3 text-left transition-colors min-h-11",
                on
                  ? "border-ember/50 bg-ember/10"
                  : "border-charcoal/12 bg-parchment/60 hover:border-ember/30",
              )}
            >
              <span className="font-ui text-sm font-medium text-charcoal">
                {f.label}
              </span>
              {on ? (
                <span className="mt-1 block font-body text-xs text-charcoal-muted">
                  {f.note}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {!done ? (
        <Button
          variant="ember"
          size="lg"
          disabled={lit.length === 0}
          onClick={commit}
        >
          Tend the blaze
        </Button>
      ) : (
        <ResultBanner
          result={result}
          text={
            result === "victory"
              ? "The ground is no longer cold. When contact arrives, the conversation begins with recognition."
              : result === "field-note"
                ? "A few flames burn — not yet a landscape. Tend more fires, and measure each one."
                : "A single flame warms few. Tend more fires before the advance."
          }
        />
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
                ? "Some foundations stand — reinforce the rest before you summon numbers or move in darkness."
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
      ? "Victory"
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
          <Check className="size-5 text-success" strokeWidth={2} />
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
