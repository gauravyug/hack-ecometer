/**
 * cityAverages.js
 *
 * Small dataset of per-capita average annual CO2e (kg) for a handful of tracked cities.
 * These are illustrative but based on typical public datasets (order-of-magnitude).
 */

const CITY_AVERAGES = [
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, avgKgPerYear: 5000 },
  { name: 'New York', lat: 40.7128, lon: -74.0060, avgKgPerYear: 6000 },
  { name: 'London', lat: 51.5074, lon: -0.1278, avgKgPerYear: 5500 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, avgKgPerYear: 2000 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, avgKgPerYear: 7000 }
];

function findNearestCity(lat, lon) {
  let best = null;
  let bestDist = Infinity;
  for (const c of CITY_AVERAGES) {
    const d = Math.sqrt(Math.pow(lat - c.lat, 2) + Math.pow(lon - c.lon, 2));
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

module.exports = { CITY_AVERAGES, findNearestCity };