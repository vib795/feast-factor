# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Feast Factor is a single-page macronutrient calculator (deployed at https://www.feastfactor.xyz/). A user enters body stats, activity level, fitness goal, and a macro split; the app returns daily calories and protein/carb/fat grams.

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npx eslint src/` — lint the source (see Known issue below — `npm run lint` is currently broken)

There is no test suite or test runner configured.

## Stack & conventions

- **Next.js 15 Pages Router** (`src/pages/`), **React 19**, **Tailwind CSS 3**. Not the App Router — ignore App Router assumptions; the README's "Project Structure" section incorrectly references `app/page.tsx`.
- Plain **JavaScript** (`.js`), no TypeScript. `jsconfig.json` maps `@/*` to `./src/*`.
- `src/pages/api/hello.js` is the unused Next.js scaffold stub.
- Deployed on Vercel as the `macro-calculator` project (production domain `www.feastfactor.xyz`).

## Architecture

`src/pages/index.js` renders `<MacroCalculator />`; there is no routing or backend. State is entirely client-side `useState`.

- **`src/lib/macros.js`** — pure, framework-free nutrition logic and reference data: `calculateBMR` (revised Harris-Benedict, separate male/female coefficients), `calculateMacros` (BMR → activity multiplier → goal calorie delta → gram split, 4 cal/g protein & carbs, 9 cal/g fat), `rebalanceMacros`, and the `ACTIVITY_LEVELS` / `GOALS` / `RECOMMENDATIONS` / `MACRO_META` tables. Change nutrition behavior here, not in the component.
- **`src/components/MacroCalculator.js`** — the entire UI, assembled from module-scope sub-components (`Segmented`, `MacroSlider`, `DonutChart`, `ResultPanel`, `RecommendationCard`, `DisclaimerModal`, …) plus a `useCountUp` animation hook. Form fields live in one `form` state object; the macro split lives in a separate `macros` object.
- **Fonts** load via `next/font/google` in `_app.js` (Bricolage Grotesque / Hanken Grotesk / JetBrains Mono), exposed as the `--font-display` / `--font-body` / `--font-mono` CSS variables and wired into Tailwind's `fontFamily`.
- **Theme** — the dark palette (`ink`, `surface`, `lime`, `protein`/`carbs`/`fat`, …) and keyframe animations live in `tailwind.config.mjs`; ambient background layers and range-slider styling live in `globals.css`.

### Things to know before editing

- **The macro split always totals 100.** Dragging any slider runs `rebalanceMacros`, which redistributes the other two proportionally — so there is no "must equal 100%" validation anywhere. Preserve that invariant if you change the macro inputs.
- **Results are live after the first calculation.** The Calculate button sets `hasCalculated`; from then on a `useEffect` recomputes `result` on every form/macro change (guarded by `isComplete`).
- Changing the height unit clears all height fields.
- Keep `src/lib/macros.js` numerically identical to the original formulas unless intentionally changing results.

### Known issue

`next lint` — and the lint step inside `next build` — crashes with `Cannot serialize key "parse" in parser`. This is a pre-existing Next 15.1.x + ESLint 9 flat-config bug and is non-fatal: `next build` still exits 0. Lint with `npx eslint src/` directly until Next is upgraded.
