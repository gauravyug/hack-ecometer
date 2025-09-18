// src/utils/achievementsData.js
export const BADGES = [
  {
    id: 'first-log',
    title: 'First Log',
    description: 'Logged your first activity',
    icon: '🏆', // Or a React component for the icon
    category: 'First Steps' // Add this line
  },
  {
    id: 'weekly-streak',
    title: 'Weekly Streak',
    description: 'Tracked activities 7 days in a row',
    icon: '🔥',
    category: 'Consistency' // Add this line
  },
  {
    id: 'meat-free-day',
    title: 'Meat-Free Day',
    description: 'Logged a meat-free day',
    icon: '🥦',
    category: 'Diet' // Add this line
  },
  // Add category to all other badges
];


export const CHALLENGES = [
  {
    id: 'meat-free-week',
    title: 'Meat-free Week',
    description: 'Avoid meat for 7 days',
    goal: 7, // Add this line
  },
  {
    id: 'bike-50km',
    title: 'Bike 50 km',
    description: 'Accumulate 50 km by bike this month',
    goal: 50, // Add this line
  },
  // Add goal to all other challenges
];

