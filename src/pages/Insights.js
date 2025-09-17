// src/pages/Insights.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Compare from './Compare';
import emissionsTargets from '../utils/emissionsTargets';

function Insights({ user }) {
  const [allActivities, setAllActivities] = useState([]);
  const [totalFootprint, setTotalFootprint] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch activities for the analysis for the CURRENT user
  useEffect(() => {
     console.log("Current user object:", user); // Keep this line for debugging if you want
    const fetchActivities = async () => {
      if (user) {
        setLoading(true);
        // Corrected query with the 'where' clause to filter by userId
        const q = query(
          collection(db, "activities"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const userActivities = [];
        let calculatedTotal = 0;
        querySnapshot.forEach((doc) => {
          const activityData = doc.data();
          userActivities.push({ id: doc.id, ...activityData });
          calculatedTotal += parseFloat(activityData.footprint);
        });
        setAllActivities(userActivities);
        setTotalFootprint(calculatedTotal);
        setLoading(false);
      } else {
        setAllActivities([]);
        setLoading(false);
      }
    };
    fetchActivities();
  }, [user]); // The correct dependency is the 'user' prop

  const getChartData = () => {
    const data = {};
    allActivities.forEach(activity => {
      const category = activity.category.charAt(0).toUpperCase() + activity.category.slice(1);
      const footprintValue = parseFloat(activity.footprint);

      if (!isNaN(footprintValue)) {
        if (data[category]) {
          data[category] += footprintValue;
        } else {
          data[category] = footprintValue;
        }
      }
    });

    const chartData = Object.keys(data).map(key => ({
      name: key,
      'Carbon Footprint (kg CO₂) ': data[key]
    }));

    return chartData;
  };

  const chartData = getChartData();
  
  if (loading) return <p>Loading detailed insights...</p>;
  
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Detailed Insights & Analysis</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Footprint by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Carbon Footprint (kg CO₂) " fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Total Lifetime Footprint</h2>
        <p className="text-5xl font-bold mb-4">{totalFootprint.toFixed(2)} <span className="text-xl text-gray-500">kg CO₂</span></p>
      </div>

      {/* Goals and Compare side-by-side */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Set Emission Reduction Goals</h2>
          <GoalSettings totalFootprint={totalFootprint} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Compare to Averages</h2>
          <Compare defaultAnnual={Number(totalFootprint)} />
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">All Logged Activities</h2>
      <div className="space-y-4">
        {allActivities.length > 0 ? (
          allActivities.map((activity) => (
            <div key={activity.id} className="p-4 bg-gray-100 rounded shadow">
              <p><strong>Category:</strong> {activity.category}</p>
              <p><strong>Type:</strong> {activity.type}</p>
              <p><strong>Amount:</strong> {activity.amount}</p>
              <p><strong>Footprint:</strong> {activity.footprint.toFixed(2)} kg CO₂</p>
              <p className="text-sm text-gray-500">
                {activity.timestamp ? new Date(activity.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          ))
        ) : (
          <p className="p-6 bg-white rounded-lg shadow-md">No activities to display.</p>
        )}
      </div>
    </div>
  );
}

export default Insights;

// GoalSettings component
function GoalSettings({ totalFootprint }) {
  const [baseline, setBaseline] = useState(totalFootprint || 1200);
  const [targetPercent, setTargetPercent] = useState(50);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 5);
  const [result, setResult] = useState(null);

  function calculateGoals() {
    try {
      const years = Math.max(1, targetYear - new Date().getFullYear());
      const t = emissionsTargets.createTargets({ baselineAnnual: Number(baseline), targetReductionPercent: Number(targetPercent), years });
      const p = emissionsTargets.progressToYear({ baselineAnnual: Number(baseline), currentAnnual: Number(totalFootprint), targetYear: Number(targetYear), targetReductionPercent: Number(targetPercent), asOfYear: new Date().getFullYear() });
      const planArr = emissionsTargets.buildLinearPlan({ baselineAnnual: Number(baseline), targetYear: Number(targetYear), asOfYear: new Date().getFullYear(), targetReductionPercent: Number(targetPercent) });
      setResult({ t, p, planArr });
    } catch (err) {
      alert(err.message || String(err));
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div>
          <label className="block font-medium">Baseline annual emissions (kg CO2e)</label>
          <input type="number" className="border p-2 w-full" value={baseline} onChange={e => setBaseline(e.target.value)} />

          <label className="block font-medium mt-3">Target reduction (%)</label>
          <input type="number" className="border p-2 w-full" value={targetPercent} onChange={e => setTargetPercent(e.target.value)} />

          <label className="block font-medium mt-3">Target year</label>
          <input type="number" className="border p-2 w-full" value={targetYear} onChange={e => setTargetYear(e.target.value)} />

          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded" onClick={calculateGoals}>Calculate goals</button>
        </div>

        <div>
          <h3 className="text-xl font-semibold">Results</h3>
          {!result && <p className="text-sm text-gray-600">No results yet. Click "Calculate goals".</p>}
          {result && (
            <div className="mt-3">
              <p><strong>Annual target:</strong> {result.t.annualTarget.toFixed(2)} kg CO2e</p>
              <p><strong>Monthly target:</strong> {result.t.monthlyTarget.toFixed(2)} kg CO2e</p>
              <p className="mt-2"><strong>Progress:</strong> {result.p.progressPercent.toFixed(1)}% completed</p>
              <p><strong>Projected completion (linear):</strong> {result.p.projectedYearIfLinear ?? 'N/A'}</p>
            </div>
          )}
        </div>
      </div>

      {result && result.planArr && result.planArr.length > 0 && (
        <div className="mt-6 max-w-2xl">
          <h4 className="font-semibold">Yearly plan</h4>
          <table className="w-full mt-2 border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 border">Year</th>
                <th className="text-left p-2 border">Target annual (kg CO2e)</th>
              </tr>
            </thead>
            <tbody>
              {result.planArr.map(row => (
                <tr key={row.year}>
                  <td className="p-2 border">{row.year}</td>
                  <td className="p-2 border">{Number(row.targetAnnual).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}