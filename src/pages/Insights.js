import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

import Compare from './Compare';
import emissionsTargets from '../utils/emissionsTargets';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function Insights({ user, darkMode }) {
    const [activities, setActivities] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('Lifetime');
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [totalFootprint, setTotalFootprint] = useState(0);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);
    const location = useLocation();

    useEffect(() => {
        const fetchActivities = async () => {
            if (user) {
                setLoading(true);
                try {
                    const q = query(collection(db, 'activities'), where('userId', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    const fetchedActivities = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null
                    }));
                    setActivities(fetchedActivities);
                    console.log("Fetched Activities:", fetchedActivities);
                } catch (error) {
                    console.error("Error fetching activities:", error);
                }
                setLoading(false);
            }
        };
        fetchActivities();
    }, [user]);

    useEffect(() => {
        const today = new Date();
        let startDate;

        switch (selectedPeriod) {
            case 'Day':
                startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                break;
            case 'Week':
                startDate = new Date(today.setDate(today.getDate() - today.getDay()));
                break;
            case 'Lifetime':
            default:
                startDate = null;
                break;
        }

        const filtered = activities.filter(activity => {
            if (startDate === null) {
                return true;
            }
            return activity.createdAt && activity.createdAt >= startDate;
        });

        console.log("Filtered Activities:", filtered);
        setFilteredActivities(filtered);
    }, [activities, selectedPeriod]);

    useEffect(() => {
        const sum = filteredActivities.reduce((total, activity) => {
            const footprint = Number(activity.footprint) || 0;
            return total + footprint;
        }, 0);
        setTotalFootprint(sum);
        console.log("Calculated Total Footprint:", sum);

        const data = filteredActivities.reduce((acc, activity) => {
            const category = activity.category || 'Uncategorized';
            const points = Number(activity.footprint) || 0;

            const existingCategory = acc.find(item => item.name === category);
            if (existingCategory) {
                existingCategory.points += points;
            } else {
                acc.push({ name: category, points: points });
            }
            return acc;
        }, []);
        setChartData(data);
    }, [filteredActivities]);

    // In Insights.js (when rendering)
    <button
  onClick={() => handleDelete(activity.id)}
  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
>
  Delete
</button>

    // Handler
  // AFTER (no auth usage)
const handleDelete = async (id) => {
  if (!window.confirm("Delete this activity?")) return;
  try {
    await deleteDoc(doc(db, "activities", id));
    setActivities(prev => prev.filter(a => a.id !== id));
  } catch (e) {
    console.error("Error deleting activity:", e);
    alert(e?.message || String(e));
  }
};


    const navigate = useNavigate();

    const handleEdit = (activity) => {
    navigate('/log-activity', { state: { activity } });
  };


    const data = {
        labels: chartData.map(item => item.name.charAt(0).toUpperCase() + item.name.slice(1)),
        datasets: [
            {
                label: 'Carbon Footprint (kg CO₂)',
                data: chartData.map(item => item.points.toFixed(2)),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)', // Red
                    'rgba(54, 162, 235, 0.6)', // Blue
                    'rgba(255, 206, 86, 0.6)', // Yellow
                    'rgba(75, 192, 192, 0.6)', // Green
                    'rgba(153, 102, 255, 0.6)', // Purple
                    'rgba(255, 159, 64, 0.6)',  // Orange
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Footprint by Category',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className={`p-4 ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
            <div className="flex justify-center mb-4">
                <button onClick={() => setSelectedPeriod('Day')} className={`px-4 py-2 rounded-l-lg border ${selectedPeriod === 'Day' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>Day</button>
                <button onClick={() => setSelectedPeriod('Week')} className={`px-4 py-2 border-t border-b ${selectedPeriod === 'Week' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>Week</button>
                <button onClick={() => setSelectedPeriod('Lifetime')} className={`px-4 py-2 rounded-r-lg border ${selectedPeriod === 'Lifetime' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>Lifetime</button>
            </div>

            {/* Main content container with max-width and centering */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8">
                    <h3 className="text-xl font-bold mb-4 text-center">Footprint by Category</h3>
                    <Bar data={data} options={options} />
                </div>

                {location.pathname === '/insights' && (
                    <div className="mt-8">
                        <h3 className="text-xl font-bold mb-2">Total Lifetime Footprint</h3>
                        <p className="text-2xl font-semibold">
                            <span className="text-green-600">{totalFootprint.toFixed(2)}</span> kg CO₂
                        </p>
                    </div>
                )}

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

                {/* Detailed Activity List */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">Detailed Activities</h3>
                    {loading ? (
                        <p className="text-center text-gray-500">Loading activities...</p>
                    ) : filteredActivities.length > 0 ? (
                        <div className="space-y-4">
                            {filteredActivities.sort((a, b) => b.createdAt - a.createdAt).map(activity => (
                                <div key={activity.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                                    <p className="font-semibold">Category: <span className="font-normal">{activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}</span></p>
                                    <p className="font-semibold">Type: <span className="font-normal">{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</span></p>
                                    <p className="font-semibold">Footprint: <span className="font-normal">{Number(activity.footprint).toFixed(2)} kg CO₂</span></p>
                                    <p className="text-sm text-gray-500">
                                        Logged on: {new Date(activity.createdAt).toLocaleString()}
                                    </p>
                                    <div className="mt-2 flex gap-3">
    <button
      onClick={() => handleEdit(activity)}
      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
    >
      Edit
    </button>
    <button
      onClick={() => handleDelete(activity.id)}
      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
    >
      Delete
    </button>
  </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No activities found for this period.</p>
                    )}
                </div>
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