// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { db } from '../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import BadgeCard from '../components/BadgeCard';

function Profile({ user, darkMode }) {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalFootprint, setTotalFootprint] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');

      const fetchUserData = async () => {
        setLoading(true);
        // Fetch activities to calculate footprint and count
        const activitiesQuery = query(collection(db, 'activities'), where('userId', '==', user.uid));
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const fetchedActivities = activitiesSnapshot.docs.map(doc => doc.data());

        const total = fetchedActivities.reduce((sum, activity) => sum + (Number(activity.footprint) || 0), 0);
        setTotalFootprint(total);
        setActivitiesCount(fetchedActivities.length);

        // Fetch earned badges
        const badgesQuery = query(collection(db, 'users', user.uid, 'badges'));
        const badgesSnapshot = await getDocs(badgesQuery);
        const fetchedBadges = badgesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEarnedBadges(fetchedBadges);
        
        setLoading(false);
      };
      fetchUserData();
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        await updateProfile(user, { displayName });
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-4 md:p-6 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-2xl font-bold text-center mb-6">User Profile</h1>

      {/* User Information and Update Form */}
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Details</h2>
        <p className="mb-2"><span className="font-semibold">Email:</span> {user.email}</p>
        <p className="mb-4"><span className="font-semibold">User ID:</span> {user.uid}</p>
        
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Update Profile
          </button>
        </form>
      </div>

      {/* User Statistics */}
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <p className="text-3xl font-bold">{totalFootprint.toFixed(2)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Footprint (kg CO₂)</p>
          </div>
          <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <p className="text-3xl font-bold">{activitiesCount}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Activities Logged</p>
          </div>
        </div>
      </div>

      {/* Latest Achievements (Badges) */}
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Latest Badges</h2>
        {loading ? (
          <p>Loading badges...</p>
        ) : earnedBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {earnedBadges.slice(0, 3).map((badge, index) => (
              <BadgeCard key={index} badge={badge} earned={true} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No badges earned yet. Start logging activities to earn your first badge!</p>
        )}
      </div>
    </div>
  );
}

export default Profile;