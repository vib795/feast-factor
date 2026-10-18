import { useState, useEffect, useRef } from 'react';
import {
  ACTIVITY_LEVELS,
  GOALS,
  MACRO_KEYS,
  MACRO_META,
  calculateMacros,
  getRecommendation,
  rebalanceMacros,
} from '@/lib/macros';

/* ----------------------------------------------------------------------------
 * Shared styles
 * ------------------------------------------------------------------------- */

const inputClass =
  'w-full rounded-xl border border-line bg-surface-2 px-4 py-3 font-mono text-[15px] ' +
  'text-zinc-100 placeholder:text-zinc-600 outline-none transition-all duration-200 ' +
  'focus:border-ember/50 focus:ring-2 focus:ring-ember/15';

/* ----------------------------------------------------------------------------
 * Icons
 * ------------------------------------------------------------------------- */

const strokeIcon = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const IconDown = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...strokeIcon}>
    <path d="M12 5v14" />
    <path d="M19 12l-7 7-7-7" />
  </svg>
);

const IconEqual = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...strokeIcon}>
    <path d="M5 9h14" />
    <path d="M5 15h14" />
  </svg>
);

const IconUp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...strokeIcon}>
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
);

const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...strokeIcon} strokeWidth={2.4}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

const LogoMark = () => (
  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ember">
    <svg width="17" height="17" viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="#0b0b0c"
        strokeWidth="3.6"
        strokeDasharray="32 50"
        strokeLinecap="round"
      />
    </svg>
  </span>
);

/* ----------------------------------------------------------------------------
 * Animated count-up
 * ------------------------------------------------------------------------- */

function useCountUp(target, duration = 850) {
  const [display, setDisplay] = useState(0);
  const valueRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = valueRef.current;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (target - from) * eased;
      valueRef.current = current;
      setDisplay(current);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

function Counter({ value, decimals = 0 }) {
  const n = useCountUp(value);
  return (
    <>
      {n.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </>
  );
}

/* ----------------------------------------------------------------------------
 * Building blocks
 * ------------------------------------------------------------------------- */

function SectionHeader({ index, title, accent }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] font-medium text-ember">{index}</span>
      <h2 className="font-display text-lg font-bold text-zinc-50">{title}</h2>
      <span className="h-px flex-1 bg-line" />
      {accent ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
          {accent}
        </span>
      ) : null}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
          {label}
        </span>
        {hint ? (
          <span className="truncate text-[11px] text-zinc-600">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Segmented({ options, value, onChange, size = 'md' }) {
  const pad = size === 'sm' ? 'px-2.5 py-2 text-xs' : 'px-3 py-2.5 text-sm';
  return (
    <div
      className="grid gap-1 rounded-xl border border-line bg-surface-2 p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all duration-200 ${pad} ${
              active
                ? 'bg-ember text-ink shadow-[0_6px_22px_-8px_rgba(255,106,31,0.7)]'
                : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function StackedBar({ macros }) {
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-white/5">
      {MACRO_KEYS.map((key) => (
        <div
          key={key}
          className="h-full transition-all duration-300 ease-out"
          style={{ width: `${macros[key]}%`, backgroundColor: MACRO_META[key].color }}
        />
      ))}
    </div>
  );
}

function MacroSlider({ macroKey, value, onChange }) {
  const meta = MACRO_META[macroKey];
  const track = `linear-gradient(to right, ${meta.color} 0%, ${meta.color} ${value}%, var(--track) ${value}%, var(--track) 100%)`;
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: meta.color }}
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-300">
            {meta.label}
          </span>
        </div>
        <span className="font-mono text-sm font-bold text-zinc-50">
          {value}
          <span className="text-zinc-500">%</span>
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={(e) => onChange(macroKey, Number(e.target.value))}
        style={{ background: track }}
        aria-label={`${meta.label} percentage`}
      />
    </div>
  );
}

function DonutChart({ protein, carbs, fat }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setProgress(1), 80);
    return () => clearTimeout(id);
  }, []);

  const R = 52;
  const C = 2 * Math.PI * R;
  const segments = [
    { pct: protein, color: MACRO_META.protein.color },
    { pct: carbs, color: MACRO_META.carbs.color },
    { pct: fat, color: MACRO_META.fat.color },
  ];

  let acc = 0;
  const arcs = segments.map((seg, i) => {
    const len = C * (seg.pct / 100) * progress;
    const arc = (
      <circle
        key={i}
        cx="60"
        cy="60"
        r={R}
        fill="none"
        stroke={seg.color}
        strokeWidth="13"
        strokeDasharray={`${len} ${C - len}`}
        strokeDashoffset={-acc}
        style={{
          transition:
            'stroke-dasharray 1.1s cubic-bezier(0.22,1,0.36,1), stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)',
        }}
      />
    );
    acc += len;
    return arc;
  });

  return (
    <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
      <circle cx="60" cy="60" r={R} fill="none" stroke="#232327" strokeWidth="13" />
      {arcs}
    </svg>
  );
}

function MacroTile({ macroKey, grams, pct }) {
  const meta = MACRO_META[macroKey];
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3.5 text-center">
      <div className="flex items-center justify-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400">
          {meta.label}
        </span>
      </div>
      <div className="mt-2 font-mono text-2xl font-bold text-zinc-50">
        <Counter value={grams} decimals={1} />
        <span className="text-sm text-zinc-500">g</span>
      </div>
      <div className="mt-0.5 font-mono text-[11px] text-zinc-500">{pct}%</div>
    </div>
  );
}

function RecommendationCard({ recommendation, gender, goalLabel, onApply }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] font-medium text-ember">REC</span>
        <h2 className="font-display text-lg font-bold text-zinc-50">
          Recommended split
        </h2>
      </div>
      <p className="mt-1.5 text-sm text-zinc-500">
        Typical ranges for {gender === 'male' ? 'men' : 'women'} ·{' '}
        {goalLabel.toLowerCase()} weight
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {MACRO_KEYS.map((key) => (
          <div
            key={key}
            className="rounded-xl border border-line bg-surface-2 p-3 text-center"
          >
            <span
              className="mx-auto mb-1.5 block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: MACRO_META[key].color }}
            />
            <div className="font-mono text-base font-bold text-zinc-50">
              {recommendation.display[key]}%
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-500">
              {MACRO_META[key].label}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onApply}
        className="mt-4 w-full rounded-xl border border-ember/30 bg-ember/10 py-2.5 text-sm font-semibold text-ember transition-colors hover:bg-ember/[0.16]"
      >
        Apply this split
      </button>
    </div>
  );
}

function ResultPanel({ result }) {
  if (!result) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-6">
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface-2">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="8"
                fill="none"
                stroke="#5a5a5f"
                strokeWidth="2.4"
                strokeDasharray="30 16"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <p className="font-display text-base font-bold text-zinc-300">
            No results yet
          </p>
          <p className="mt-1 max-w-[16rem] text-sm text-zinc-600">
            Fill in your details and hit calculate to see your daily targets.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up rounded-3xl border border-ember/20 bg-surface p-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] font-medium text-ember">OUT</span>
        <h2 className="font-display text-lg font-bold text-zinc-50">
          Your daily targets
        </h2>
      </div>

      <div className="relative mx-auto mt-6 h-52 w-52">
        <DonutChart
          protein={result.proteinPct}
          carbs={result.carbsPct}
          fat={result.fatPct}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            kcal / day
          </span>
          <span className="font-mono text-[2.6rem] font-bold leading-none text-zinc-50">
            <Counter value={result.dailyCalories} />
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2.5">
        {MACRO_KEYS.map((key) => (
          <MacroTile
            key={key}
            macroKey={key}
            grams={result[key]}
            pct={result[`${key}Pct`]}
          />
        ))}
      </div>
    </div>
  );
}

function DisclaimerModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Disclaimer"
        className="relative w-full max-w-md animate-fade-up rounded-2xl border border-line bg-surface p-7 shadow-2xl"
      >
        <h2 className="font-display text-xl font-bold text-zinc-50">Disclaimer</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Feast Factor is for informational and educational purposes only and is
          not medical advice. Always consult a qualified healthcare provider or
          registered dietitian before changing your diet or exercise routine. Use
          of this tool is at your own risk, and the creator assumes no liability
          for decisions made based on its results.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-white/[0.06] py-3 text-sm font-semibold text-zinc-100 transition-colors hover:bg-white/[0.1]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Main component
 * ------------------------------------------------------------------------- */

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const WEIGHT_UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'lbs', label: 'lbs' },
];

const HEIGHT_UNITS = [
  { value: 'cm', label: 'Centimeters' },
  { value: 'ft', label: 'Feet & inches' },
];

const GOAL_OPTIONS = GOALS.map((g) => ({
  value: g.value,
  label: g.label,
  icon:
    g.value === 'lose_weight' ? (
      <IconDown />
    ) : g.value === 'gain_weight' ? (
      <IconUp />
    ) : (
      <IconEqual />
    ),
}));

function isComplete(form) {
  if (!form.weight || !form.age) return false;
  return form.heightUnit === 'cm' ? !!form.heightCm : !!form.heightFeet;
}

const MacroCalculator = () => {
  const [form, setForm] = useState({
    gender: 'male',
    age: '',
    weight: '',
    weightUnit: 'kg',
    heightUnit: 'ft',
    heightCm: '',
    heightFeet: '',
    heightInches: '',
    activityLevel: 'sedentary',
    goal: 'lose_weight',
  });
  const [macros, setMacros] = useState({ protein: 40, carbs: 40, fat: 20 });
  const [result, setResult] = useState(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const resultRef = useRef(null);

  const recommendation = getRecommendation(form.gender, form.goal);
  const selectedActivity =
    ACTIVITY_LEVELS.find((a) => a.value === form.activityLevel) ?? ACTIVITY_LEVELS[0];
  const selectedGoal = GOALS.find((g) => g.value === form.goal) ?? GOALS[0];

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const onNumberChange = (e) => setField(e.target.name, e.target.value);

  const setHeightUnit = (unit) =>
    setForm((f) => ({
      ...f,
      heightUnit: unit,
      heightCm: '',
      heightFeet: '',
      heightInches: '',
    }));

  const onMacroChange = (key, value) =>
    setMacros((m) => rebalanceMacros(m, key, value));

  const applyRecommended = () => setMacros({ ...recommendation.preset });

  // Live-recompute once the user has calculated at least once.
  useEffect(() => {
    if (!hasCalculated || !isComplete(form)) return;
    setResult(
      calculateMacros({
        ...form,
        proteinPct: macros.protein,
        carbsPct: macros.carbs,
        fatPct: macros.fat,
      }),
    );
  }, [form, macros, hasCalculated]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isComplete(form)) return;
    setResult(
      calculateMacros({
        ...form,
        proteinPct: macros.protein,
        carbsPct: macros.carbs,
        fatPct: macros.fat,
      }),
    );
    setHasCalculated(true);
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        90,
      );
    }
  };

  return (
    <>
      <div className="bg-atmosphere" />
      <div className="bg-grid" />

      <main className="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {/* ---- Header ---- */}
        <header className="animate-fade-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-display text-base font-extrabold tracking-tight text-zinc-50">
                Feast Factor
              </span>
            </div>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-600 sm:block">
              nutrition instrument
            </span>
          </div>

          <div className="mt-12 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1">
              <span className="h-1.5 w-1.5 animate-glow rounded-full bg-ember" />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                Harris–Benedict engine
              </span>
            </div>
            <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.03] tracking-tight text-zinc-50 sm:text-6xl">
              Dial in your
              <br />
              <span className="text-ember">daily macros.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-zinc-400">
              Precision nutrition targets — calories, protein, carbs and fat —
              calculated from your body, activity level and goal. No sign-up,
              instant results.
            </p>
          </div>
        </header>

        {/* ---- Body grid ---- */}
        <div className="mt-12 grid grid-cols-1 gap-5 lg:mt-14 lg:grid-cols-12">
          {/* Form */}
          <section
            className="animate-fade-up lg:col-span-7"
            style={{ animationDelay: '90ms' }}
          >
            <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-9">
                {/* Section 01 — Profile */}
                <div className="space-y-5">
                  <SectionHeader index="01" title="Your profile" />

                  <Field label="Biological sex" hint="used by the BMR formula">
                    <Segmented
                      options={GENDER_OPTIONS}
                      value={form.gender}
                      onChange={(v) => setField('gender', v)}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Age" hint="years">
                      <input
                        className={inputClass}
                        type="number"
                        name="age"
                        min="1"
                        max="120"
                        value={form.age}
                        onChange={onNumberChange}
                        placeholder="—"
                        aria-label="Age in years"
                        required
                      />
                    </Field>

                    <Field label="Weight">
                      <div className="flex gap-2">
                        <input
                          className={inputClass}
                          type="number"
                          step="0.1"
                          name="weight"
                          value={form.weight}
                          onChange={onNumberChange}
                          placeholder="—"
                          aria-label="Weight"
                          required
                        />
                        <div className="w-[108px] shrink-0">
                          <Segmented
                            size="sm"
                            options={WEIGHT_UNITS}
                            value={form.weightUnit}
                            onChange={(v) => setField('weightUnit', v)}
                          />
                        </div>
                      </div>
                    </Field>
                  </div>

                  <Field label="Height">
                    <div className="space-y-3">
                      <Segmented
                        options={HEIGHT_UNITS}
                        value={form.heightUnit}
                        onChange={setHeightUnit}
                      />
                      {form.heightUnit === 'cm' ? (
                        <input
                          className={inputClass}
                          type="number"
                          step="0.1"
                          name="heightCm"
                          value={form.heightCm}
                          onChange={onNumberChange}
                          placeholder="Centimeters"
                          aria-label="Height in centimeters"
                          required
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className={inputClass}
                            type="number"
                            name="heightFeet"
                            value={form.heightFeet}
                            onChange={onNumberChange}
                            placeholder="Feet"
                            aria-label="Height in feet"
                            required
                          />
                          <input
                            className={inputClass}
                            type="number"
                            name="heightInches"
                            value={form.heightInches}
                            onChange={onNumberChange}
                            placeholder="Inches"
                            aria-label="Height inches"
                          />
                        </div>
                      )}
                    </div>
                  </Field>
                </div>

                {/* Section 02 — Activity & goal */}
                <div className="space-y-5">
                  <SectionHeader index="02" title="Activity & goal" />

                  <Field label="Activity level" hint={selectedActivity.desc}>
                    <div className="flex flex-wrap gap-2">
                      {ACTIVITY_LEVELS.map((a) => {
                        const active = a.value === form.activityLevel;
                        return (
                          <button
                            key={a.value}
                            type="button"
                            onClick={() => setField('activityLevel', a.value)}
                            className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                              active
                                ? 'border-ember bg-ember text-ink'
                                : 'border-line bg-surface-2 text-zinc-400 hover:border-white/15 hover:text-zinc-100'
                            }`}
                          >
                            {a.label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <Field label="Goal" hint={selectedGoal.desc}>
                    <Segmented
                      options={GOAL_OPTIONS}
                      value={form.goal}
                      onChange={(v) => setField('goal', v)}
                    />
                  </Field>
                </div>

                {/* Section 03 — Macro split */}
                <div className="space-y-5">
                  <SectionHeader
                    index="03"
                    title="Macro split"
                    accent="auto-balanced"
                  />

                  <StackedBar macros={macros} />

                  <div className="space-y-5">
                    {MACRO_KEYS.map((key) => (
                      <MacroSlider
                        key={key}
                        macroKey={key}
                        value={macros[key]}
                        onChange={onMacroChange}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={applyRecommended}
                    className="w-full rounded-xl border border-dashed border-line py-2.5 text-[13px] font-medium text-zinc-500 transition-colors hover:border-ember/40 hover:text-ember"
                  >
                    Apply recommended split for{' '}
                    {form.gender === 'male' ? 'men' : 'women'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-ember px-6 py-4 font-display text-[15px] font-extrabold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_44px_-12px_rgba(255,106,31,0.65)] active:translate-y-0"
                >
                  {hasCalculated ? 'Recalculate' : 'Calculate my macros'}
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    <IconArrow />
                  </span>
                </button>
              </form>
            </div>
          </section>

          {/* Recommendations + results */}
          <aside
            className="animate-fade-up lg:col-span-5"
            style={{ animationDelay: '170ms' }}
          >
            <div className="space-y-5 lg:sticky lg:top-6">
              <RecommendationCard
                recommendation={recommendation}
                gender={form.gender}
                goalLabel={selectedGoal.label}
                onApply={applyRecommended}
              />
              <div ref={resultRef}>
                <ResultPanel result={result} />
              </div>
            </div>
          </aside>
        </div>

        {/* ---- Footer ---- */}
        <footer className="mt-14 flex flex-col items-center gap-3 border-t border-line pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-[13px] text-zinc-600">
            Estimates only — not medical advice.{' '}
            <button
              type="button"
              onClick={() => setShowDisclaimer(true)}
              className="text-zinc-400 underline decoration-zinc-700 underline-offset-2 transition-colors hover:text-ember"
            >
              Read disclaimer
            </button>
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-700">
            Feast Factor · {new Date().getFullYear()}
          </p>
        </footer>
      </main>

      <DisclaimerModal
        open={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
      />
    </>
  );
};

export default MacroCalculator;
