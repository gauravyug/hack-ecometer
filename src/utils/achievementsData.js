// src/utils/achievementsData.js
export const BADGES = [
  { id: 'first-log', title: 'First Log', description: 'Logged your first activity', icon: '🏆' },
  { id: 'weekly-streak', title: 'Weekly Streak', description: 'Tracked activities 7 days in a row', icon: '🔥' },
  { id: 'meat-free-day', title: 'Meat-Free Day', description: 'Logged a meat-free day', icon: '🥦' },
];

export const CHALLENGES = [
  { id: 'meat-free-week', title: 'Meat-free Week', description: 'Avoid meat for 7 days', startAt: null, endAt: null, goalType: 'meat-free-days', goalValue: 7, rewardBadgeId: 'meat-free-day' },
  { id: 'bike-50', title: 'Bike 50 km', description: 'Accumulate 50 km by bike this month', startAt: null, endAt: null, goalType: 'bike-km', goalValue: 50, rewardBadgeId: null },
];