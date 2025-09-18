import React, { useState, useRef } from 'react';
import { db, auth } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import BarcodeScanner from '../components/BarcodeScanner';
import jsQR from 'jsqr';

const emissionFactors = {
  travel: {
    car: 0.21,
    bus: 0.11,
    flight: 0.15,
  },
  food: {
    mutton: 27,
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

    const fileInputRef = useRef(null);
    const [showScanner, setShowScanner] = useState(false);
    const [hasScanData, setHasScanData] = useState(false);

    const handleScanSuccess = (scannedProduct) => {
        // Accept numbers or strings for amount/footprint
        setCategory(scannedProduct.category);
        setType(scannedProduct.type);
        setAmount(String(scannedProduct.amount));
        setFootprint(Number(scannedProduct.footprint).toFixed(2));
        setHasScanData(true);
    };

    const handleScanError = (error) => {
        console.error("Scanning failed:", error);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        console.log('Image selected:', file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.src = ev.target.result;
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
                    if (code) {
                        console.log('QR code found in uploaded image:', code.data);
                        // Simulate mapping QR payload to activity
                        handleScanSuccess({ category: 'food', type: 'vegetables', amount: 0.5, footprint: 1.0 });
                        return;
                    }
                } catch (err) {
                    console.error('Error decoding uploaded image', err);
                }
                // Fallback: simulate image analysis (e.g., Vision API would return a result)
                alert('No barcode found — simulating food detection and populating the form');
                handleScanSuccess({ category: 'food', type: 'vegetables', amount: 0.5, footprint: 1.0 });
            };
        };
        reader.readAsDataURL(file);
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
    
    // Open the hidden file input to capture/upload an image
    const handleImageCapture = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    return (
        <div className="container max-w-4xl mx-auto p-4 md:p-6">

            <div className="flex flex-col items-center">
                <h1 className="text-2xl font-bold mb-4 text-center w-full lg:w-3/4">Log Your Activity</h1>

                     {/* image upload and scanner controls moved into the Scan/Capture panel below */}

                {/* Scan/Capture Box - prominent ribbon with placeholder */}
                <div className="w-full lg:w-3/4 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900 dark:to-gray-800 p-1 rounded-lg mb-6">
                    <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg shadow-lg border-2 border-blue-400 flex flex-col items-center">
                        <div className="w-full flex justify-between items-center mb-4">
                            <span className="inline-block bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full">Scan</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Optional</span>
                        </div>
                        <div className="w-full h-40 flex items-center justify-center rounded-md border-2 border-dashed border-blue-300 dark:border-blue-700 bg-white dark:bg-blue-800">
                            <div className="text-center text-gray-600 dark:text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                                </svg>
                                <div className="font-semibold">Scan or Capture Image</div>
                                <div className="text-sm">Tap to open camera or upload a photo</div>
                            </div>
                        </div>
                        <div className="mt-4 w-full flex flex-col items-center gap-3">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleImageCapture}
                                    className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
                                >
                                    Upload Image
                                </button>
                                {/* hidden file input triggered by Upload Image button */}
                                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                                <button
                                    type="button"
                                    onClick={() => { setShowScanner(true); }}
                                    className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
                                >
                                    Open Camera
                                </button>
                            </div>

                            <div className="w-full">
                                {showScanner && (
                                    <div>
                                        <BarcodeScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} autoStart hideControls />
                                        <div className="mt-2 text-center">
                                            <button onClick={() => setShowScanner(false)} className="text-sm text-red-600">Close Scanner</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 flex justify-center">
                                <button
                                    onClick={() => handleScanSuccess({ category: 'food', type: 'vegetables', amount: 0.5, footprint: 1.0 })}
                                    className={`px-4 py-2 rounded ${hasScanData ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                                    disabled={!hasScanData}
                                >
                                    Simulate Scan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* OR Badge - large and centered */}
                <div className="flex items-center w-full lg:w-3/4 mb-6">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                    <span className="mx-4 text-3xl font-extrabold text-gray-700 dark:text-gray-200">OR</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                </div>

                {/* Form Box - separated panel */}
                <div className="w-full lg:w-3/4 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border-2 border-gray-300 dark:border-gray-700">
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
        </div>
    );
};

export default LogActivity;