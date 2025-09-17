import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
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
        return true; // Return all activities for Lifetime
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

  const data = {
    labels: chartData.map(item => item.name.charAt(0).toUpperCase() + item.name.slice(1)),
    datasets: [
      {
        label: 'Carbon Footprint (kg CO₂)',
        data: chartData.map(item => item.points.toFixed(2)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
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

      {/* Detailed Activity List */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Detailed Activities</h3>
        {loading ? (
          <p className="text-center text-gray-500">Loading activities...</p>
        ) : filteredActivities.length > 0 ? (
          <div className="space-y-4">
            {filteredActivities.sort((a,b) => b.createdAt - a.createdAt).map(activity => (
              <div key={activity.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <p className="font-semibold">Category: <span className="font-normal">{activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}</span></p>
                <p className="font-semibold">Type: <span className="font-normal">{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</span></p>
                <p className="font-semibold">Footprint: <span className="font-normal">{Number(activity.footprint).toFixed(2)} kg CO₂</span></p>
                <p className="text-sm text-gray-500">
                  Logged on: {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No activities found for this period.</p>
        )}
      </div>
    </div>
  );
}

export default Insights;