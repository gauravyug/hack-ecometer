/**
 * emissionsTargets.js
 *
 * Small utility to calculate emission reduction targets (monthly/annual)
 * and progress towards a 'net-zero' (net-zero) target year.
 *
 * API:
 * - createTargets({baselineAnnual, targetReductionPercent, years}) -> {annualTarget, monthlyTarget}
 * - progressToYear({baselineAnnual, currentAnnual, targetYear, targetReductionPercent, asOfYear}) -> {progressPercent, remainingPercent, projectedYearIfLinear}
 * - buildLinearPlan({baselineAnnual, targetYear, asOfYear}) -> array of yearly targets
 *
 * Notes / assumptions:
 * - Emissions measured in same units (e.g., kg CO2e per year). baselineAnnual and currentAnnual are annual totals.
 * - targetReductionPercent is percent reduction relative to baseline (0-100). For example 50 means 50% reduction vs baseline.
 * - If targetYear equals asOfYear, progress is computed against target for the same year.
 */

/**
 * Create simple annual and monthly targets given a baseline and target reduction percent over a period (years)
 * @param {{baselineAnnual:number, targetReductionPercent:number, years?:number}} opts
 * @returns {{annualTarget:number, monthlyTarget:number, yearlyReductionAbsolute?:number}}
 */
function createTargets(opts) {
  const { baselineAnnual, targetReductionPercent, years = 1 } = opts;
  if (baselineAnnual == null || isNaN(baselineAnnual)) throw new Error('baselineAnnual must be a number');
  if (isNaN(targetReductionPercent)) throw new Error('targetReductionPercent must be a number');

  const reductionFraction = Math.max(0, Math.min(100, targetReductionPercent)) / 100;
  const annualTarget = baselineAnnual * (1 - reductionFraction);
  // linear per-year reduction absolute (if years provided)
  const yearlyReductionAbsolute = (baselineAnnual - annualTarget) / Math.max(1, years);
  const monthlyTarget = annualTarget / 12;
  return { annualTarget, monthlyTarget, yearlyReductionAbsolute };
}

/**
 * Build a linear yearly plan from baseline to zero (or a given target) between asOfYear (inclusive) and targetYear (inclusive)
 * @param {{baselineAnnual:number, targetYear:number, asOfYear?:number, targetReductionPercent?:number}} opts
 * @returns {Array<{year:number, targetAnnual:number}>}
 */
function buildLinearPlan(opts) {
  const { baselineAnnual, targetYear, asOfYear = new Date().getFullYear(), targetReductionPercent } = opts;
  if (baselineAnnual == null || isNaN(baselineAnnual)) throw new Error('baselineAnnual must be a number');
  if (!Number.isInteger(targetYear)) throw new Error('targetYear must be integer year');

  const years = Math.max(1, targetYear - asOfYear);
  const endAnnual = typeof targetReductionPercent === 'number'
    ? baselineAnnual * (1 - Math.max(0, Math.min(100, targetReductionPercent)) / 100)
    : 0;

  const plan = [];
  for (let i = 0; i <= years; i++) {
    const year = asOfYear + i;
    const t = i / years; // 0..1
    const targetAnnual = baselineAnnual + (endAnnual - baselineAnnual) * t;
    plan.push({ year, targetAnnual });
  }
  return plan;
}

/**
 * Compute progress toward a reduction goal set for a target year.
 * Returns progress percent (how much of the required reduction has been achieved) and remaining percent.
 * Also tries to estimate projected year to reach full reduction assuming linear progress from baseline->current rate.
 * @param {{baselineAnnual:number, currentAnnual:number, targetYear:number, targetReductionPercent:number, asOfYear?:number}} opts
 * @returns {{progressPercent:number, remainingPercent:number, projectedYearIfLinear:number|null, targetAnnual:number}}
 */
function progressToYear(opts) {
  const { baselineAnnual, currentAnnual, targetYear, targetReductionPercent, asOfYear = new Date().getFullYear() } = opts;
  if (baselineAnnual == null || currentAnnual == null) throw new Error('baselineAnnual and currentAnnual required');
  if (!Number.isInteger(targetYear)) throw new Error('targetYear must be integer year');

  const reductionFraction = Math.max(0, Math.min(100, targetReductionPercent || 100)) / 100;
  const targetAnnual = baselineAnnual * (1 - reductionFraction);

  // required absolute reduction from baseline to reach target
  const requiredReduction = baselineAnnual - targetAnnual;
  // achieved reduction from baseline to current
  const achievedReduction = Math.max(0, baselineAnnual - currentAnnual);

  const progressPercent = requiredReduction <= 0 ? 100 : Math.min(100, (achievedReduction / requiredReduction) * 100);
  const remainingPercent = Math.max(0, 100 - progressPercent);

  // if there is time between asOfYear and targetYear, compute how many years remain and the rate
  const yearsRemaining = Math.max(0, targetYear - asOfYear);

  // compute annual reduction rate achieved so far relative to baseline year (naive):
  // If achievedReduction is 0, projectedYearIfLinear is null (no progress yet)
  let projectedYearIfLinear = null;
  if (achievedReduction > 0) {
    // assume linear rate from baseline to current over 1 year of observed progress (conservative)
    const annualRate = achievedReduction; // per year equivalent (user can adapt)
    const remainingAbsolute = Math.max(0, requiredReduction - achievedReduction);
    const yearsToFinish = annualRate <= 0 ? Infinity : remainingAbsolute / annualRate;
    if (!isFinite(yearsToFinish)) projectedYearIfLinear = null;
    else projectedYearIfLinear = Math.round(asOfYear + yearsToFinish);
  }

  return { progressPercent, remainingPercent, projectedYearIfLinear, targetAnnual };
}

module.exports = {
  createTargets,
  buildLinearPlan,
  progressToYear,
};