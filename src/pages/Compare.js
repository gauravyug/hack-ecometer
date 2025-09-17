import React, { useEffect, useState } from 'react';
import eq from '../utils/impactEquivalents';
import { CITY_AVERAGES, findNearestCity } from '../utils/cityAverages';
import { COUNTRY_AVERAGES, computeWorldAverage } from '../utils/countryAverages';

function Compare({ defaultAnnual = 0 }) {
  const [annual, setAnnual] = useState(defaultAnnual || 0);
  const [nearCity, setNearCity] = useState(CITY_AVERAGES[0]);
  const [mode, setMode] = useState('city'); // 'city' | 'country' | 'world'
  const [selectedCity, setSelectedCity] = useState(CITY_AVERAGES[0].name);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_AVERAGES[0].code);

  useEffect(() => {
    // try navigator geolocation to pick nearest tracked city
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const c = findNearestCity(lat, lon) || CITY_AVERAGES[CITY_AVERAGES.length - 1];
        setNearCity(c);
        setSelectedCity(c.name);
      }, (err) => {
        // ignore errors, keep default
      });
    }
  }, []);

  const worldAverage = computeWorldAverage();

  let avgObj = null;
  let avg = worldAverage;
  if (mode === 'city') {
    avgObj = CITY_AVERAGES.find(c => c.name === selectedCity) || CITY_AVERAGES[0];
    avg = avgObj.avgKgPerYear;
  } else if (mode === 'country') {
    const country = COUNTRY_AVERAGES.find(c => c.code === selectedCountry) || COUNTRY_AVERAGES[0];
    avgObj = { name: country.name, avgKgPerYear: country.avgKgPerYear };
    avg = country.avgKgPerYear;
  } else {
    avgObj = { name: 'World average', avgKgPerYear: worldAverage };
    avg = worldAverage;
  }

  const diff = annual - avg;
  const diffPercent = avg === 0 ? 0 : (diff / avg) * 100;

  const trees = eq.treesForKg(Math.max(0, annual));
  const miles = eq.carMilesForKg(Math.max(0, annual));
  const charges = eq.phoneChargesForKg(Math.max(0, annual));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Compare Your Footprint</h1>

      <div className="max-w-2xl">
        <label className="block font-medium">Your annual footprint (kg CO2e)</label>
        <input type="number" className="border p-2 w-full" value={annual} onChange={e => setAnnual(Number(e.target.value))} />

        <label className="block font-medium mt-3">Compare with</label>
        <div className="flex gap-2 mb-2">
          <button className={`px-3 py-1 border ${mode === 'city' ? 'bg-green-200' : ''}`} onClick={() => setMode('city')}>City</button>
          <button className={`px-3 py-1 border ${mode === 'country' ? 'bg-green-200' : ''}`} onClick={() => setMode('country')}>Country</button>
          <button className={`px-3 py-1 border ${mode === 'world' ? 'bg-green-200' : ''}`} onClick={() => setMode('world')}>World</button>
        </div>

        {mode === 'city' && (
          <select className="border p-2 w-full" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
            {CITY_AVERAGES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        )}

        {mode === 'country' && (
          <select className="border p-2 w-full" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}>
            {COUNTRY_AVERAGES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        )}

        {mode === 'world' && (
          <div className="p-2 border bg-gray-50">World average: {worldAverage.toLocaleString()} kg CO2e / year</div>
        )}

        <div className="mt-4">
          <p><strong>{avgObj.name} average:</strong> {avg.toLocaleString()} kg CO2e / year</p>
          <p><strong>Your footprint:</strong> {Number(annual).toLocaleString()} kg CO2e / year</p>
          <p className="mt-2">You are {Math.abs(diffPercent).toFixed(1)}% {diff > 0 ? 'above' : 'below'} the {avgObj.name} average.</p>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold">Relatable impact</h2>
          <ul className="list-disc list-inside mt-2">
            <li>This equals planting <strong>{Math.round(trees).toLocaleString()}</strong> mature trees absorbing CO2 for one year.</li>
            <li>Or driving approximately <strong>{Math.round(miles).toLocaleString()}</strong> car miles.</li>
            <li>Or charging a smartphone around <strong>{Math.round(charges).toLocaleString()}</strong> times.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Compare;
