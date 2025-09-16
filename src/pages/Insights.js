// src/pages/Insights.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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