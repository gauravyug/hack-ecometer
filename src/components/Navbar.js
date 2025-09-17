// src/components/Navbar.js
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

function Navbar({ user, darkMode, setDarkMode }) {
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <nav className="p-4 bg-gray-200 dark:bg-gray-800 flex justify-between items-center">
            <div className="font-bold text-lg">Eco Meter</div>
            <div>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="mr-4 px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded"
                >
                    {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
                {user ? (
                    <>
                        <Link className="mx-2 hover:underline" to="/">Home</Link>
                        <Link className="mx-2 hover:underline" to="/insights">Insights</Link>
                        <Link className="mx-2 hover:underline" to="/profile">Profile</Link>
                        <button onClick={handleLogout} className="mx-2 hover:underline">Logout</button>
                    </>
                ) : (
                    <>
                        <Link className="mx-2 hover:underline" to="/login">Login</Link>
                        <Link className="mx-2 hover:underline" to="/signup">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
