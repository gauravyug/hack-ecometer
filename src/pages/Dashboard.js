// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, getDocs, orderBy, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { getLocationBasedSuggestions } from '../utils/locationSuggestions';
import BarcodeScanner from '../components/BarcodeScanner';

// Emission factors from your calculator
const emissionFactors = {
  travel: { car: 0.21, bus: 0.11, flight: 0.15 },
  food: { mutton: 27, chicken: 6.9, vegetables: 2 },
  shopping: { electronics: 3, clothing: 1.5, groceries: 0.5 },
  home_energy: { electricity: 0.45, natural_gas: 0.2, oil: 0.3 }
};

function Dashboard({ user }) {
  const [allActivities, setAllActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [totalFootprint, setTotalFootprint] = useState(0);
  const [timeframe, setTimeframe] = useState('lifetime');
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [goal, setGoal] = useState(null);

  // States for the calculator form
  const [category, setCategory] = useState('travel');
  const [type, setType] = useState('car');
  const [amount, setAmount] = useState('');
  const [footprint, setFootprint] = useState(0);

  // Fetch geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        (error) => console.error("Geolocation error:", error)
      );
    }
  }, []);

  // Fetch user's goal and activities
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().goal) {
          setGoal(userDocSnap.data().goal);
        } else {
          setGoal(null);
        }
        
        const q = query(
          collection(db, "activities"),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const userActivities = [];
        querySnapshot.forEach((doc) => userActivities.push({ id: doc.id, ...doc.data() }));
        setAllActivities(userActivities);
        setLoading(false);
      } else {
        setAllActivities([]);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Filter activities and calculate total footprint based on timeframe
  useEffect(() => {
    let filtered = [];
    let total = 0;
    const now = new Date();

    if (timeframe === 'lifetime') {
      filtered = allActivities;
    } else if (timeframe === 'week') {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      filtered = allActivities.filter(activity => activity.timestamp.toDate() >= oneWeekAgo);
    } else if (timeframe === 'day') {
      const oneDayAgo = new Date(now.setDate(now.getDate() - 1));
      filtered = allActivities.filter(activity => activity.timestamp.toDate() >= oneDayAgo);
    }
    
    filtered.forEach(activity => total += parseFloat(activity.footprint));
    setFilteredActivities(filtered);
    setTotalFootprint(total);
  }, [timeframe, allActivities]);

  const getChartData = () => {
    const data = {};
    filteredActivities.forEach(activity => {
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

  const calculateFootprint = () => {
    let factor = 0;
    if (emissionFactors[category] && emissionFactors[category][type]) {
      factor = emissionFactors[category][type];
    }
    const calculatedFootprint = parseFloat(amount) * factor;
    setFootprint(calculatedFootprint.toFixed(2));
  };

  const logActivity = async () => {
    if (!user) {
      alert("Please log in to log an activity.");
      return;
    }
    if (!amount || !footprint) {
      alert("Please calculate a footprint first.");
      return;
    }
    try {
      await addDoc(collection(db, "activities"), {
        userId: user.uid,
        category: category,
        type: type,
        amount: parseFloat(amount),
        footprint: parseFloat(footprint),
        timestamp: serverTimestamp(),
      });
      alert('Activity logged successfully!');
      setAmount('');
      setFootprint(0);
      const q = query(collection(db, "activities"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const userActivities = [];
      querySnapshot.forEach((doc) => userActivities.push({ id: doc.id, ...doc.data() }));
      setAllActivities(userActivities);
    } catch (e) {
      console.error("Error adding document: ", e);
      alert('Failed to log activity. Please try again.');
    }
  };

  const handleScanSuccess = (scannedProduct) => {
    setCategory(scannedProduct.category);
    setType(scannedProduct.type);
    setAmount(scannedProduct.amount);
    setFootprint(scannedProduct.footprint.toFixed(2));
  };

  const handleScanError = (error) => {
    console.error("Scanning failed:", error);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    const newType = Object.keys(emissionFactors[newCategory])[0];
    setType(newType);
    setAmount('');
    setFootprint(0);
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setAmount('');
    setFootprint(0);
  };

  const getPlaceholderText = () => {
    switch (category) {
      case 'travel': return 'Distance (km)';
      case 'food': return 'Weight (grams)';
      case 'shopping': return 'Cost (USD)';
      case 'home_energy': return 'Usage (kWh)';
      default: return 'Amount';
    }
  };
  
  const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    console.log("Image selected:", file.name);
    // TODO: Send this file to a backend service for analysis
    alert("Image selected! Now to send it to the Vision API...");
  }
};
  const chartData = getChartData();
  const locationSuggestions = location ? getLocationBasedSuggestions(location.latitude, location.longitude) : null;
  const goalProgressPercentage = goal ? Math.min((totalFootprint / goal) * 100, 100) : 0;
  const userName = user?.displayName || 'Eco-Warrior';
  
  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome, {userName}!</h1>

      {locationSuggestions && (
        <div className="bg-blue-100 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-2">Based on your location...</h2>
          <p className="mb-2">You are in a location with a {locationSuggestions.description}.</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {locationSuggestions.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <div className="w-40 h-40">
            <CircularProgressbar
              value={totalFootprint}
              maxValue={1000}
              text={`${totalFootprint.toFixed(2)}`}
              styles={buildStyles({
                textColor: '#000',
                pathColor: `#4CAF50`,
                trailColor: '#d6d6d6',
              })}
            />
          </div>
          <h3 className="text-xl font-semibold mt-4">Total Footprint</h3>
          <p className="text-gray-500">kg CO₂ ({timeframe})</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <div className="w-40 h-40">
            <CircularProgressbar
              value={goalProgressPercentage}
              text={`${goalProgressPercentage.toFixed(0)}%`}
              styles={buildStyles({
                textColor: '#000',
                pathColor: `rgb(76, 175, 80, ${goalProgressPercentage / 100})`,
                trailColor: '#d6d6d6',
              })}
            />
          </div>
          <h3 className="text-xl font-semibold mt-4">Goal Progress</h3>
          {goal && (
            <p className="text-gray-500 mt-1">Goal: {goal.toFixed(2)} kg CO₂</p>
          )}
        </div>
      </div>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setTimeframe('day')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${timeframe === 'day' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Today
        </button>
        <button
          onClick={() => setTimeframe('week')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${timeframe === 'week' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeframe('lifetime')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${timeframe === 'lifetime' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Lifetime
        </button>
      </div>

      {filteredActivities.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Footprint by Category</h2>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8" style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Carbon Footprint (kg CO₂) " fill="#4CAF50" />
            </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
      
      <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Log Your Activities</h2>
        
        {/* NEW: Added Image Upload section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Scan with Image</h3>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="w-full p-2 border rounded-md" 
          />
        </div>
        
        {/* NEW: Added Barcode Scanner and Simulate Scan Button */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6 items-center">
          <div className="flex-1 w-full md:w-auto">
            <BarcodeScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
          </div>
          <button 
            onClick={() => handleScanSuccess({
              category: "food",
              type: "vegetables",
              amount: 0.5,
              footprint: 1.0
            })}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1 w-full md:w-auto"
          >
            Simulate Scan
          </button>
        </div>
        
        {/* Remaining Form Fields */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Category</label>
          <select value={category} onChange={handleCategoryChange} className="w-full p-3 border rounded-md">
            {Object.keys(emissionFactors).map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Type</label>
          <select value={type} onChange={handleTypeChange} className="w-full p-3 border rounded-md">
            {Object.keys(emissionFactors[category]).map(t => (
              <option key={t} value={t}>{t.replace(/_/g, ' ').charAt(0).toUpperCase() + t.replace(/_/g, ' ').slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">{getPlaceholderText()}</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={calculateFootprint}
            placeholder={getPlaceholderText()}
            className="w-full p-3 border rounded-md"
          />
        </div>
        <div className="mb-6">
          <p className="text-gray-700 font-bold">Estimated Footprint: <span className="text-green-600 font-bold">{footprint} kg CO₂</span></p>
        </div>
        <button
          onClick={logActivity}
          className="w-full p-3 text-white font-bold rounded-md bg-green-500 hover:bg-green-600 transition-colors"
        >
          Log Activity
        </button>
      </div>
    </div>
  );
}

export default Dashboard;