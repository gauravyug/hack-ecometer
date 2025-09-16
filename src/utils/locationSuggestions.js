const locations = [
  {
    name: "urban_city",
    latitude: 34.0522,
    longitude: -118.2437,
    description: "dense urban city",
    suggestions: [
      "Use public transport or ride-sharing to reduce emissions from heavy traffic.",
      "Support local businesses to reduce shopping-related footprint.",
      "Consider using a bicycle for short commutes."
    ]
  },
  {
    name: "rural_area",
    latitude: 39.7392,
    longitude: -104.9903,
    description: "rural area with limited public transport",
    suggestions: [
      "Plan your errands to reduce car trips.",
      "Consider planting a home garden to reduce food-related emissions.",
      "Opt for local, seasonal produce from farmer's markets."
    ]
  },
  {
    name: "suburban_area",
    latitude: 40.7128,
    longitude: -74.0060,
    description: "suburban area with a mix of options",
    suggestions: [
      "Look for hybrid or electric vehicles to reduce fuel consumption.",
      "Check for local composting programs to manage food waste.",
      "Optimize your home energy usage by turning off lights and unplugging electronics."
    ]
  }
];

const getLocationBasedSuggestions = (userLat, userLon) => {
  let closestLocation = null;
  let minDistance = Infinity;

  locations.forEach(loc => {
    const distance = Math.sqrt(
      Math.pow(userLat - loc.latitude, 2) + Math.pow(userLon - loc.longitude, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = loc;
    }
  });

  return closestLocation;
};

export { getLocationBasedSuggestions };