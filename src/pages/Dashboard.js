// src/pages/Dashboard.js 
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getLocationBasedSuggestions } from '../utils/locationSuggestions';
import BarcodeScanner from '../components/BarcodeScanner';
import { motion } from 'framer-motion';

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
    const [category, setCategory] = useState('travel');
    const [type, setType] = useState('car');
    const [amount, setAmount] = useState('');
    const [footprint, setFootprint] = useState(0);
    const [tips, setTips] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
                (error) => console.error("Geolocation error:", error)
            );
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                setLoading(true);
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists() && userDocSnap.data().goal) {
                    setGoal(userDocSnap.data().goal);
                }
                const q = query(collection(db, "activities"), orderBy("timestamp", "desc"));
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
      useEffect(() => {
      if (category && type) {
          setTips(getHelpfulTips(category, type));
      } else {
          setTips("");
      }
  }, [category, type]);

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

    useEffect(() => {
        let newTips = '';
        if (category === 'travel') {
            newTips = "Consider using public transport or carpooling to reduce emissions.";
        } else if (category === 'food') {
            newTips = "Eating plant-based meals can significantly lower your carbon footprint.";
        } else if (category === 'shopping') {
            newTips = "Buy durable products and avoid fast fashion.";
        } else if (category === 'home_energy') {
            newTips = "Switch to LED lights and unplug devices when not in use.";
        }
        setTips(newTips);
    }, [category, type]);

    const getChartData = () => {
        const data = {};
        filteredActivities.forEach(activity => {
            const cat = activity.category.charAt(0).toUpperCase() + activity.category.slice(1);
            const value = parseFloat(activity.footprint);
            if (!isNaN(value)) {
                if (data[cat]) {
                    data[cat] += value;
                } else {
                    data[cat] = value;
                }
            }
        });
        return Object.keys(data).map(key => ({
            name: key,
            'Carbon Footprint': data[key]
        }));
    };

    const calculateFootprint = () => {
        let factor = 0;
        if (emissionFactors[category] && emissionFactors[category][type]) {
            factor = emissionFactors[category][type];
        }
        const calc = parseFloat(amount) * factor;
        setFootprint(calc.toFixed(2));
    };

    const logActivity = async () => {
        if (!user) {
            setErrorMessage("Please log in first.");
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            setErrorMessage("Please enter a valid amount.");
            return;
        }
        if (!footprint || parseFloat(footprint) <= 0) {
            setErrorMessage("Invalid footprint. Please check your input.");
            return;
        }
        try {
            setErrorMessage('');
            await addDoc(collection(db, "activities"), {
                userId: user.uid,
                category: category,
                type: type,
                amount: parseFloat(amount),
                footprint: parseFloat(footprint),
                timestamp: serverTimestamp()
            });
            alert("Activity logged!");
            setAmount('');
            setFootprint(0);
            const q = query(collection(db, "activities"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            const activities = [];
            querySnapshot.forEach(doc => activities.push({ id: doc.id, ...doc.data() }));
            setAllActivities(activities);
        } catch (e) {
            console.error("Error:", e);
            setErrorMessage("Error logging activity.");
        }
    };

    const handleScanSuccess = (scannedProduct) => {
        setCategory(scannedProduct.category);
        setType(scannedProduct.type);
        setAmount(scannedProduct.amount);
        setFootprint(scannedProduct.footprint.toFixed(2));
    };

    const handleScanError = (error) => {
        console.error("Scan error:", error);
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
            alert("Image selected! Ready for analysis.");
        }
    };
    const getHelpfulTips = (category, type) => {
      if (category === "travel" && type === "car") {
          return "Consider using public transport or carpooling to reduce emissions.";
      }
      if (category === "food" && type === "mutton") {
          return "Opt for plant-based foods to lower your carbon footprint.";
      }
      if (category === "shopping" && type === "electronics") {
          return "Buy energy-efficient electronics to save resources.";
      }
      if (category === "home_energy" && type === "electricity") {
          return "Turn off unused lights and appliances to save energy.";
      }
      return "";
  };

    const chartData = getChartData();
    const locationSuggestions = location ? getLocationBasedSuggestions(location.latitude, location.longitude) : null;
    const goalProgress = goal ? Math.min((totalFootprint / goal) * 100, 100) : 0;
    const userName = user?.displayName || "Eco-Warrior";

    if (loading) return <p>Loading...</p>;

    return (
        <div className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'} p-4 sm:p-6 max-w-7xl mx-auto min-h-screen`}>
            <div className="flex justify-between items-center mb-6">
                <motion.h1 
                    className="text-3xl font-bold text-center flex-grow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    Welcome, {userName}!
                </motion.h1>
                <button 
                    onClick={() => setDarkMode(!darkMode)} 
                    className="ml-4 p-2 bg-gray-200 rounded hover:bg-gray-300 transition-transform hover:scale-105 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                    {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
            </div>

            {locationSuggestions && (
                <motion.div 
                    className={`p-6 rounded-lg shadow-md mb-8 ${darkMode ? 'dark:bg-gray-800 dark:text-white bg-blue-100' : 'bg-blue-100 text-black'}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2 className="text-xl font-semibold mb-2">Based on your location...</h2>
                    <p className="mb-2">{locationSuggestions.description}</p>
                    <ul className="list-disc list-inside">
                        {locationSuggestions.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <motion.div 
                    className={`p-6 rounded-lg shadow hover:shadow-lg transition-shadow ${darkMode ? 'dark:bg-gray-800 dark:text-white bg-white' : 'bg-white text-black'}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-40 h-40 mx-auto">
                        <CircularProgressbar
                            value={totalFootprint}
                            maxValue={1000}
                            text={`${totalFootprint.toFixed(2)}`}
                            styles={buildStyles({
                                textColor: '#000',
                                pathColor: '#4CAF50',
                                trailColor: '#d6d6d6'
                            })}
                        />
                    </div>
                    <h3 className="text-lg font-semibold text-center mt-4">Total Footprint</h3>
                    <p className="text-center text-gray-500">kg CO₂ ({timeframe})</p>
                </motion.div>

                <motion.div 
                    className={`p-6 rounded-lg shadow hover:shadow-lg transition-shadow ${darkMode ? 'dark:bg-gray-800 dark:text-white bg-white' : 'bg-white text-black'}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="w-40 h-40 mx-auto">
                        <CircularProgressbar
                            value={goalProgress}
                            text={`${goalProgress.toFixed(0)}%`}
                            styles={buildStyles({
                                textColor: '#000',
                                pathColor: `rgba(76, 175, 80, ${goalProgress / 100})`,
                                trailColor: '#d6d6d6'
                            })}
                        />
                    </div>
                    <h3 className="text-lg font-semibold text-center mt-4">Goal Progress</h3>
                    {goal && <p className="text-center text-gray-500 mt-1">Goal: {goal.toFixed(2)} kg CO₂</p>}
                </motion.div>
            </div>

            <div className="flex justify-center space-x-4 mb-8">
                {['day', 'week', 'lifetime'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTimeframe(t)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-transform hover:scale-105 ${timeframe === t ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {filteredActivities.length > 0 && (
                <motion.div
                    className={`p-6 rounded-lg shadow-md mb-8 ${darkMode ? 'dark:bg-gray-800 dark:text-white bg-white' : 'bg-white text-black'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-xl font-semibold mb-4 text-center">Footprint by Category</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Carbon Footprint" fill="#4CAF50" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            )}

            <motion.div 
                className={`p-8 rounded-lg shadow-md max-w-lg mx-auto ${darkMode ? 'dark:bg-gray-800 dark:text-white bg-white' : 'bg-white text-black'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <h2 className="text-xl font-semibold mb-6 text-center">Log Your Activities</h2>

                {errorMessage && (
                    <div className="text-red-500 text-sm mb-4 text-center">{errorMessage}</div>
                )}

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Scan with Image</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className={`w-full p-2 border rounded-md ${darkMode ? 'dark:bg-gray-700 dark:text-white dark:border-gray-600' : ''}`} />
                </div>

                <div className="mb-4">
                    <button onClick={() => alert('Starting scanner...')} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-transform hover:scale-105">Start Barcode Scanner</button>
                    <button onClick={() => alert('Simulating scan...')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-transform hover:scale-105 ml-2">Simulate Scan</button>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Category</label>
                    <select value={category} onChange={handleCategoryChange} className={`w-full p-2 border rounded-md ${darkMode ? 'dark:bg-gray-700 dark:text-white dark:border-gray-600' : ''}`}>
                        {Object.keys(emissionFactors).map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Type</label>
                    <select value={type} onChange={handleTypeChange} className={`w-full p-2 border rounded-md ${darkMode ? 'dark:bg-gray-700 dark:text-white dark:border-gray-600' : ''}`}>
                        {Object.keys(emissionFactors[category]).map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">{getPlaceholderText()}</label>
                    <input type="number" value={amount} onChange={e => { setAmount(e.target.value); calculateFootprint(); }} placeholder={getPlaceholderText()} className={`w-full p-2 border rounded-md ${darkMode ? 'dark:bg-gray-700 dark:text-white dark:border-gray-600' : ''}`} />
                </div>

                <div className="mb-4 text-center">
                    <p>Estimated Footprint: <span className="font-bold">{footprint} kg CO₂</span></p>
                </div>

                {tips && (
                    <div className={`p-3 rounded-md mb-4 ${darkMode ? 'dark:bg-gray-700 dark:text-white bg-gray-100 text-black' : 'bg-gray-100 text-black'}`}>
                        <p>{tips}</p>
                    </div>
                )}

                <div className="text-center">
                    <button onClick={logActivity} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-transform hover:scale-105">Log Activity</button>
                </div>
            </motion.div>
        </div>
    );
}

export default Dashboard;
