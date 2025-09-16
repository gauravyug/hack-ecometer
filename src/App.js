// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Components and Pages
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profiles';
import Insights from './pages/Insights'; // The new Insights pag
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

  if (!isAuthReady) {
    return <p>Loading app...</p>;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} />
        <div className="flex-grow container mx-auto p-4">
          <Routes>
            {/* Redirects to Dashboard if user is logged in, otherwise to Login */}
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/insights" element={user ? <Insights /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            {/* The Login page is only accessible if the user is NOT logged in */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            
            {/* The dashboard route points to the main dashboard page */}
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;