// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

// Components and Pages
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register'; // <-- NEW: Import the Register component
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profiles';
import Insights from './pages/Insights'; 
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully.");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  if (!isAuthReady) {
    return <p>Loading app...</p>;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex-grow container mx-auto p-4">
          <Routes>
            {/* Pass the user prop to the pages */}
            <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/insights" element={user ? <Insights user={user} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
            
            {/* The Login page is only accessible if the user is NOT logged in */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <Register /> : <Navigate to="/" />} /> {/* <-- NEW: Added a route for /signup */}
            
            {/* The dashboard route points to the main dashboard page */}
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;