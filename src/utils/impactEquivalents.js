/**
 * impactEquivalents.js
 *
 * Provides simple conversions from kg CO2e into relatable equivalents.
 * Values are simplifications / approximations for communication.
 */

// Approximate conversion factors (these are illustrative averages)
const KGCO2_PER_TREE_YEAR = 21.77; // tree absorbs ~21.77 kg CO2 per year (varies widely)
const KGCO2_PER_CAR_MILE = 0.404; // ~404 g CO2 per mile (US average petrol car)
const KGCO2_PER_SMARTPHONE_CHARGE = 0.000053; // ~53 mg CO2 per phone charge (varies a lot)

function treesForKg(kg) {
  return kg / KGCO2_PER_TREE_YEAR;
}

function carMilesForKg(kg) {
  return kg / KGCO2_PER_CAR_MILE;
}

function phoneChargesForKg(kg) {
  return kg / KGCO2_PER_SMARTPHONE_CHARGE;
}

module.exports = {
  treesForKg,
  carMilesForKg,
  phoneChargesForKg,
  KGCO2_PER_TREE_YEAR,
  KGCO2_PER_CAR_MILE,
  KGCO2_PER_SMARTPHONE_CHARGE,
};