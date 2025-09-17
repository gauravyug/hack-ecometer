import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

// Components and Pages
// import Navbar from './components/Navbar'; // Navbar is now replaced by BottomTabs
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profiles';
import Insights from './pages/Insights'; 
import BottomTabs from './components/BottomTabs';
import News from './pages/News'; // Import the new News component
import LogActivity from './pages/LogActivity'; // New import
import './index.css';

// A simple component to handle logout
const Logout = () => {
    useEffect(() => {
        signOut(auth);
    }, []);
    return <Navigate to="/login" />;
};

function App() {
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

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
            <div className={darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                <div className="flex flex-col min-h-screen">
                    {/* The Navbar has been removed for a mobile-first design */}
                    
                    {/* Main content area with bottom padding */}
                    <div className="flex-grow container mx-auto p-4 pb-16">
                        <Routes>
                            <Route path="/" element={user ? <Dashboard user={user} darkMode={darkMode} /> : <Navigate to="/login" />} />
                            <Route path="/insights" element={user ? <Insights user={user} darkMode={darkMode} /> : <Navigate to="/login" />} />
                            <Route path="/profile" element={user ? <Profile user={user} darkMode={darkMode} /> : <Navigate to="/login" />} />
                            <Route path="/news" element={user ? <News user={user} darkMode={darkMode} /> : <Navigate to="/login" />} /> {/* New route for News */}
                            <Route path="/log-activity" element={user ? <LogActivity user={user} /> : <Navigate to="/login" />} /> {/* New route */}
                            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                            <Route path="/signup" element={!user ? <Register /> : <Navigate to="/" />} />
                            <Route path="/dashboard" element={user ? <Dashboard user={user} darkMode={darkMode} /> : <Navigate to="/login" />} />
                            {/* New route for logout */}
                            <Route path="/logout" element={<Logout />} />
                        </Routes>
                    </div>
                    
                    {/* Render BottomTabs and Footer conditionally */}
                    {user && (
                        <>
                            <BottomTabs />
                            <Footer />
                        </>
                    )}
                </div>
            </div>
        </Router>
    );
}

export default App;