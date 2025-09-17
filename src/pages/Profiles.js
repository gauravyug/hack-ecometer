// src/pages/Profile.js
import { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';

function Profiles({ user, darkMode }) {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
        setMessage('Profile updated successfully!');
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setMessage(`Error updating profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={`p-6 ${darkMode ? 'text-white bg-gray-800' : 'text-gray-700 bg-gray-100'} rounded-md max-w-md mx-auto mt-10`}>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className={`max-w-md mx-auto mt-10 p-8 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">User Profile</h1>

      <div className="mb-4 space-y-2">
        <p><span className="font-semibold">Email:</span> {user.email}</p>
        <p><span className="font-semibold">User ID:</span> {user.uid}</p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium mb-2">Display Name</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
            className={`w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
          />
        </div>

        <button
          type="submit"
          className={`w-full p-3 font-semibold rounded-md transition duration-200 hover:scale-105 ${darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      {message && (
        <motion.p
          className={`mt-4 text-center ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

export default Profiles;
