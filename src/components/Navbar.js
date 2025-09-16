import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

function Navbar({ user }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <nav className="bg-green-600 text-white p-4 flex justify-between items-center">
      <div className="font-bold text-xl">EcoMeter</div>
      <div>
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