/**
 * countryAverages.js
 *
 * Example per-capita average annual CO2e (kg) by country. These numbers are illustrative.
 */

const COUNTRY_AVERAGES = [
  { name: 'United States', code: 'US', avgKgPerYear: 16000 },
  { name: 'United Kingdom', code: 'GB', avgKgPerYear: 6000 },
  { name: 'India', code: 'IN', avgKgPerYear: 2000 },
  { name: 'Australia', code: 'AU', avgKgPerYear: 17000 },
  { name: 'Brazil', code: 'BR', avgKgPerYear: 4500 },
  { name: 'China', code: 'CN', avgKgPerYear: 8000 }
];

function findCountryByCode(code) {
  return COUNTRY_AVERAGES.find(c => c.code === code);
}

function computeWorldAverage() {
  // simple mean of the listed countries (illustrative). Replace with population-weighted real-world data if available.
  const sum = COUNTRY_AVERAGES.reduce((s, c) => s + c.avgKgPerYear, 0);
  return Math.round(sum / COUNTRY_AVERAGES.length);
}

module.exports = { COUNTRY_AVERAGES, findCountryByCode, computeWorldAverage };