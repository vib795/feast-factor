// Pure nutrition math + reference data for the macro calculator.
// No React, no DOM — safe to unit test or reuse anywhere.

export const MACRO_KEYS = ['protein', 'carbs', 'fat'];

export const MACRO_META = {
  protein: { label: 'Protein', color: '#ff3b6b', calsPerGram: 4 },
  carbs: { label: 'Carbs', color: '#2dd4bf', calsPerGram: 4 },
  fat: { label: 'Fat', color: '#facc15', calsPerGram: 9 },
};

// Activity multipliers applied to BMR to estimate Total Daily Energy Expenditure.
export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', multiplier: 1.2 },
  { value: 'lightly_active', label: 'Light', desc: 'Light exercise, 1–3 days/week', multiplier: 1.375 },
  { value: 'moderately_active', label: 'Moderate', desc: 'Moderate exercise, 3–5 days/week', multiplier: 1.55 },
  { value: 'very_active', label: 'Very', desc: 'Hard exercise, 6–7 days/week', multiplier: 1.725 },
  { value: 'extra_active', label: 'Extreme', desc: 'Very hard exercise or a physical job', multiplier: 1.9 },
];

// Calorie deltas applied to TDEE for each goal.
export const GOALS = [
  { value: 'lose_weight', label: 'Lose', desc: 'Cut roughly 500 kcal per day', adjustment: -500 },
  { value: 'maintain', label: 'Maintain', desc: 'Hold your current weight', adjustment: 0 },
  { value: 'gain_weight', label: 'Gain', desc: 'Add roughly 500 kcal per day', adjustment: 500 },
];

// Evidence-based macro split ranges, keyed by sex × goal. Percentages sit within
// the Acceptable Macronutrient Distribution Ranges (carbs 45–65%, fat 20–35%,
// protein 10–35%) and follow goal-specific guidance — higher protein in a
// deficit to preserve lean mass (ISSN protein position stand), ample carbs to
// fuel a surplus. Official ratios are sex-neutral; the modest male/female
// differences reflect women's lower average calorie budgets (protein at a
// higher %) and discouragement of very-low-fat intake for hormonal health.
// `display` is the range shown to the user; `preset` is a balanced split that
// always sums to 100, used by the "apply" action.
export const RECOMMENDATIONS = {
  male: {
    lose_weight: { display: { protein: '30–35', carbs: '40–50', fat: '20–25' }, preset: { protein: 33, carbs: 42, fat: 25 } },
    maintain: { display: { protein: '20–25', carbs: '50–55', fat: '20–25' }, preset: { protein: 23, carbs: 52, fat: 25 } },
    gain_weight: { display: { protein: '25–30', carbs: '50–60', fat: '20–25' }, preset: { protein: 28, carbs: 52, fat: 20 } },
  },
  female: {
    lose_weight: { display: { protein: '30–35', carbs: '35–45', fat: '25–30' }, preset: { protein: 32, carbs: 40, fat: 28 } },
    maintain: { display: { protein: '25–30', carbs: '45–55', fat: '20–25' }, preset: { protein: 28, carbs: 48, fat: 24 } },
    gain_weight: { display: { protein: '25–35', carbs: '45–55', fat: '20–30' }, preset: { protein: 30, carbs: 48, fat: 22 } },
  },
};

export function getRecommendation(gender, goal) {
  return RECOMMENDATIONS[gender]?.[goal] ?? RECOMMENDATIONS.male.lose_weight;
}

// Basal Metabolic Rate — revised Harris-Benedict equation (imperial coefficients).
export function calculateBMR({ weight, weightUnit, heightUnit, heightCm, heightFeet, heightInches, age, gender }) {
  const weightLbs = weightUnit === 'kg' ? Number(weight) * 2.20462262185 : parseFloat(weight);

  let heightInchesTotal;
  if (heightUnit === 'cm') {
    heightInchesTotal = Number(heightCm) / 2.54;
  } else {
    heightInchesTotal = parseFloat(heightFeet) * 12 + (parseFloat(heightInches) || 0);
  }

  const years = Number(age);

  if (gender === 'male') {
    return 66.473 + 6.23762 * weightLbs + 12.7084 * heightInchesTotal - 6.755 * years;
  }
  return 655.0955 + 4.33789 * weightLbs + 4.69798 * heightInchesTotal - 4.6756 * years;
}

// Full macro breakdown from a complete form snapshot.
export function calculateMacros(form) {
  const bmr = calculateBMR(form);
  const activity = ACTIVITY_LEVELS.find((a) => a.value === form.activityLevel) ?? ACTIVITY_LEVELS[0];
  const goal = GOALS.find((g) => g.value === form.goal) ?? GOALS[0];

  const tdee = bmr * activity.multiplier;
  const dailyCalories = Math.max(0, tdee + goal.adjustment);

  const grams = {};
  for (const key of MACRO_KEYS) {
    const pct = Number(form[`${key}Pct`]) || 0;
    const cals = dailyCalories * (pct / 100);
    grams[key] = Math.round((cals / MACRO_META[key].calsPerGram) * 10) / 10;
  }

  return {
    dailyCalories: Math.round(dailyCalories),
    protein: grams.protein,
    carbs: grams.carbs,
    fat: grams.fat,
    proteinPct: Number(form.proteinPct) || 0,
    carbsPct: Number(form.carbsPct) || 0,
    fatPct: Number(form.fatPct) || 0,
  };
}

// Adjust one macro and redistribute the rest so the split always totals 100.
// The two untouched macros keep their relative ratio; if both are zero the
// remainder is split evenly.
export function rebalanceMacros(current, changed, rawValue) {
  const value = Math.min(100, Math.max(0, Math.round(rawValue)));
  const others = MACRO_KEYS.filter((m) => m !== changed);
  const remaining = 100 - value;
  const otherSum = current[others[0]] + current[others[1]];

  const next = { ...current, [changed]: value };
  if (otherSum <= 0) {
    next[others[0]] = Math.round(remaining / 2);
  } else {
    next[others[0]] = Math.round((remaining * current[others[0]]) / otherSum);
  }
  next[others[1]] = remaining - next[others[0]];
  return next;
}
