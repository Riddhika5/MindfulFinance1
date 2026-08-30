// ===========================================================================
// quotas.js — recruitment quota control
// ---------------------------------------------------------------------------
// The sampling plan is a stratified quota design: 600 completed responses,
// balanced on gender, age band and settlement type. Once a cell is full the
// study must stop accepting responses into it, or the achieved sample drifts
// away from the plan and the stratification claim in the thesis is not true.
//
// Three design decisions worth stating, because each is a defensible choice
// rather than an obvious one:
//
// 1. QUOTAS ARE CHECKED TWICE — once when the participant reaches the profile
//    screen (so a person in a full cell is told immediately, before spending
//    fifteen minutes on a questionnaire that will be discarded), and again at
//    submission (because two people can pass the first check concurrently).
//    Screening someone out AFTER they have completed the whole instrument
//    would be a poor thing to do to a volunteer.
//
// 2. ONLY USABLE RESPONSES COUNT toward a cell. A submission flagged as
//    straightlining or too-fast is excluded at analysis, so counting it here
//    would close a cell that is not actually full.
//
// 3. "Other" GENDER HAS NO QUOTA CAP. The plan specifies 300 male and 300
//    female. Capping "Other" at zero would mean turning away every
//    participant who selects it, which is not defensible; leaving it
//    uncapped lets those responses be collected and reported separately.
//    They are NOT counted toward the 600.
// ===========================================================================

export const QUOTA_PLAN = {
  total: 600,

  gender: {
    label: "Gender",
    // Values must match the option strings in PROFILE.items[gender].
    targets: { Male: 300, Female: 300 },
    uncapped: ["Other"],
  },

  age: {
    label: "Age band",
    // Values must match ELIGIBILITY.items[elig_age] options.
    targets: {
      "18–24": 105,
      "25–34": 145,
      "35–44": 120,
      "45–54": 95,
      "55–64": 75,
      "65 or above": 60,
    },
    uncapped: [],
  },

  location: {
    label: "Location",
    // Values must match PROFILE.items[city] options.
    targets: {
      "Metro / Tier-1 city": 180,
      "Tier-2 city": 210,
      "Tier-3 or Tier-4 town": 120,
      "Rural area": 90,
    },
    uncapped: [],
  },
};

/** Field on the stored record that supplies each quota dimension's value. */
const FIELD = {
  gender: (r) => r.answers?.gender,
  age: (r) => r.answers?.elig_age,
  location: (r) => r.answers?.city,
};

/** A response only occupies a quota slot if it would survive data cleaning. */
export function isUsable(r) {
  return !r?.quality?.flagStraightlining && !r?.quality?.flagTooFast;
}

/**
 * Current counts per dimension per cell.
 * @param {Array} responses every stored response
 */
export function countCells(responses = []) {
  const usable = responses.filter(isUsable);
  const out = {};
  for (const dim of Object.keys(QUOTA_PLAN).filter((k) => k !== "total")) {
    const spec = QUOTA_PLAN[dim];
    const counts = {};
    for (const key of Object.keys(spec.targets)) counts[key] = 0;
    for (const key of spec.uncapped) counts[key] = 0;
    for (const r of usable) {
      const v = FIELD[dim](r);
      if (v === undefined || v === null) continue;
      counts[v] = (counts[v] || 0) + 1;
    }
    out[dim] = counts;
  }
  return { usableTotal: usable.length, submittedTotal: responses.length, cells: out };
}

/**
 * Is a given cell closed?
 * Uncapped values are never closed. Values that are not in the plan at all
 * (e.g. a "Prefer not to say" left over from an older build) are treated as
 * uncapped rather than closed — refusing an answer the instrument itself
 * offered would be the app's fault, not the participant's.
 */
function cellClosed(dim, value, counts) {
  const spec = QUOTA_PLAN[dim];
  if (value === undefined || value === null) return false;
  if (spec.uncapped.includes(value)) return false;
  const target = spec.targets[value];
  if (target === undefined) return false;
  return (counts[dim]?.[value] || 0) >= target;
}

/**
 * Decide whether this participant may proceed.
 * @param {object} profile { gender, age, location }
 * @param {object} counted result of countCells()
 */
export function quotaDecision(profile, counted) {
  const full = [];
  for (const dim of ["gender", "age", "location"]) {
    const v = profile[dim];
    if (cellClosed(dim, v, counted.cells)) {
      full.push({
        dimension: dim,
        label: QUOTA_PLAN[dim].label,
        value: v,
        target: QUOTA_PLAN[dim].targets[v],
      });
    }
  }
  const studyFull = counted.usableTotal >= QUOTA_PLAN.total;
  return {
    allowed: full.length === 0 && !studyFull,
    studyFull,
    full,
    usableTotal: counted.usableTotal,
    target: QUOTA_PLAN.total,
  };
}

/** Researcher-facing progress table. */
export function quotaReport(responses = []) {
  const counted = countCells(responses);
  const dims = {};
  for (const dim of ["gender", "age", "location"]) {
    const spec = QUOTA_PLAN[dim];
    dims[dim] = {
      label: spec.label,
      cells: Object.entries(spec.targets).map(([value, target]) => {
        const n = counted.cells[dim]?.[value] || 0;
        return { value, n, target, remaining: Math.max(0, target - n), full: n >= target };
      }),
      uncapped: spec.uncapped.map((value) => ({
        value, n: counted.cells[dim]?.[value] || 0, target: null, remaining: null, full: false,
      })),
    };
  }
  return {
    target: QUOTA_PLAN.total,
    usableTotal: counted.usableTotal,
    submittedTotal: counted.submittedTotal,
    remaining: Math.max(0, QUOTA_PLAN.total - counted.usableTotal),
    complete: counted.usableTotal >= QUOTA_PLAN.total,
    dimensions: dims,
  };
}
