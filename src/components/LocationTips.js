import React, { useState, useEffect } from 'react';

// This is a placeholder function. In a real application, you might use a
// reverse geocoding service (like Nominatim or a paid API) to get a
// more detailed location from latitude and longitude.
const getLocationType = (lat, lon) => {
    // For this example, we'll just return a static type.
    // A real implementation would have more complex logic.
    return 'suburban'; // or 'urban', 'rural'
};

// This is a placeholder for your tips data.
// In a real application, this could be fetched from a database or a file.
const tipsData = {
    suburban: [
        "You are in a suburban area with a mix of options.",
        "Look for hybrid or electric vehicles to reduce fuel consumption.",
        "Check for local composting programs to manage food waste.",
        "Optimize your home energy usage by turning off lights and unplugging electronics."
    ],
    urban: [
        "You are in an urban area with access to public transit.",
        "Consider using public transport, biking, or walking for your commute.",
        "Take advantage of local recycling programs.",
        "Use smart thermostats to optimize your home energy use."
    ],
    rural: [
        "You are in a rural area, where transportation options may be limited.",
        "Consider carpooling with neighbors for long-distance trips.",
        "Invest in a home solar energy system to reduce your carbon footprint.",
        "Support local farmers' markets to reduce food transportation emissions."
    ],
};

function LocationTips() {
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if the Geolocation API is available
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }

        // Request the user's current position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Get the location type from the coordinates
                const locationType = getLocationType(latitude, longitude);
                // Set the tips based on the location type
                setTips(tipsData[locationType]);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
    }, []);

    if (loading) {
        return <p className="text-center mt-4">Getting location-based tips...</p>;
    }

    if (error) {
        return <p className="text-center mt-4 text-red-500">Error: {error}</p>;
    }

    return (
       <div className="mb-6 p-6 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Based on your location...</h2>
                <ul className="list-disc list-inside space-y-1">
                    {tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default LocationTips;