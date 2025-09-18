import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Doughnut } from 'react-chartjs-2'; // Change from Bar to Doughnut
import LocationTips from '../components/LocationTips';
import {
  Chart as ChartJS,
  ArcElement, // New element for Doughnut chart
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement, // Register the new element
  Tooltip,
  Legend
);

function Dashboard({ user, darkMode }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [chartData, setChartData] = useState([]);
  
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
        } catch (error) {
          console.error("Error fetching activities:", error);
        }
        setLoading(false);
      }
    };
    fetchActivities();
  }, [user]);

  useEffect(() => {
    let totalPoints = 0;
    const data = activities.reduce((acc, activity) => {
      const category = activity.category || 'Uncategorized';
      const points = Number(activity.footprint) || 0;
      
      totalPoints += points;

      const existingCategory = acc.find(item => item.name === category);
      if (existingCategory) {
        existingCategory.points += points;
      } else {
        acc.push({ name: category, points: points });
      }
      return acc;
    }, []);

    setUserPoints(totalPoints);
    setChartData(data);
  }, [activities]);

  // Updated data for Donut Chart
  const donutChartData = {
    labels: chartData.map(item => item.name.charAt(0).toUpperCase() + item.name.slice(1)),
    datasets: [
      {
        label: 'Carbon Footprint (kg CO₂)',
        data: chartData.map(item => item.points.toFixed(2)),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
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

  return (
    <div className={`container mx-auto p-4 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-2">Welcome, {user.displayName || 'Gaurav'}!</h1>
      
      <div className="max-w-3xl mx-auto mb-6">
        <LocationTips />
      </div>

      {/* Log Activity Banner - Enhanced styling */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Link to="/log-activity">
          <div className="p-6 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors cursor-pointer text-center">
            <h2 className="text-2xl font-bold">Log Your Activity</h2>
            <p className="text-sm">Click here to add new details and capture images.</p>
          </div>
        </Link>
      </div>

      {/* Total Footprint and Goal Progress Circular Charts - Placeholder for new component */}
      <div className="max-w-4xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center text-center">
              <span className="text-xl font-bold">{userPoints.toFixed(2)}</span>
          </div>
          <h3 className="mt-2 text-md font-semibold text-gray-700 dark:text-gray-300">Total Footprint</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">kg CO₂ (lifetime)</p>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-gray-300 dark:border-gray-600 flex items-center justify-center text-center">
              <span className="text-xl font-bold">0%</span>
          </div>
          <h3 className="mt-2 text-md font-semibold text-gray-700 dark:text-gray-300">Goal Progress</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">of goal</p>
        </div>
      </div>
      
      {/* Donut Chart Section */}
      <div className="max-w-xl mx-auto p-4 md:p-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-bold mb-4 text-center">Footprint by Category</h3>
        {loading ? (
          <p className="text-center text-gray-500">Loading chart data...</p>
        ) : (
          <Doughnut data={donutChartData} />
        )}
      </div>
    </div>
  );
}

export default Dashboard;