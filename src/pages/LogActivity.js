import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const emissionFactors = {
  travel: {
    car: 0.21,
    bus: 0.11,
    flight: 0.15,
  },
  food: {
    beef: 27,
    chicken: 6.9,
    vegetables: 2,
  },
  shopping: {
    electronics: 3,
    clothing: 1.5,
    groceries: 0.5,
  },
  home_energy: {
    electricity: 0.45,
    natural_gas: 0.2,
    oil: 0.3,
  },
};

function LogActivity() {
    const [category, setCategory] = useState('travel');
    const [type, setType] = useState('car');
    const [amount, setAmount] = useState('');
    const [footprint, setFootprint] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const calculateFootprint = () => {
        let factor = 0;
        if (emissionFactors[category] && emissionFactors[category][type]) {
            factor = emissionFactors[category][type];
        }
        const calculatedFootprint = parseFloat(amount) * factor;
        setFootprint(calculatedFootprint.toFixed(2));
    };

    const logActivity = async () => {
        if (!auth.currentUser) {
            setError("Please log in to log an activity.");
            return;
        }
        if (!amount || !footprint) {
            setError("Please calculate a footprint first.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await addDoc(collection(db, "activities"), {
                userId: auth.currentUser.uid,
                category: category,
                type: type,
                amount: parseFloat(amount),
                footprint: parseFloat(footprint),
                createdAt: serverTimestamp(),
            });
            alert('Activity logged successfully!');
            setAmount('');
            setFootprint(0);
        } catch (e) {
            console.error("Error adding document: ", e);
            setError('Failed to log activity. Please try again.');
        }
        setLoading(false);
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
    
    // This is a placeholder for a real camera/scan function.
    const handleImageCapture = () => {
        alert('This feature would open your camera or file picker.');
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Log Your Activity</h1>

            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                {/* Image Capture and Scan Button */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image Capture / Scan</label>
                    <button
                        type="button"
                        onClick={handleImageCapture}
                        className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                        Scan or Capture Image
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Category</label>
                    <select value={category} onChange={handleCategoryChange} className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-white">
                        {Object.keys(emissionFactors).map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Type</label>
                    <select value={type} onChange={handleTypeChange} className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-white">
                        {Object.keys(emissionFactors[category]).map(t => (
                            <option key={t} value={t}>{t.replace(/_/g, ' ').charAt(0).toUpperCase() + t.replace(/_/g, ' ').slice(1)}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">{getPlaceholderText()}</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onBlur={calculateFootprint}
                        placeholder={getPlaceholderText()}
                        className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div className="mb-6">
                    <p className="text-gray-700 dark:text-gray-300 font-bold">Estimated Footprint: <span className="text-green-600 font-bold">{footprint} kg CO₂</span></p>
                </div>
                <button
                    onClick={logActivity}
                    className="w-full p-3 text-white font-bold rounded-md bg-green-500 hover:bg-green-600 transition-colors"
                    disabled={loading}
                >
                    {loading ? 'Logging...' : 'Log Activity'}
                </button>
                {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
            </div>
        </div>
    );
};

export default LogActivity;