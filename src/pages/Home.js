// src/pages/Home.js
import { useState } from 'react';
import Calculator from './Calculator';
import { db, auth } from '../firebase'; // Import Firestore and Auth
import { collection, addDoc } from 'firebase/firestore'; // Import Firestore function

function Home() {
  const [category, setCategory] = useState('travel');
  const [type, setType] = useState('car');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);

  const types = {
    travel: ['car', 'bus', 'flight'],
    food: ['beef', 'chicken', 'vegetables'],
    shopping: ['electronics', 'clothing', 'groceries'],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      alert('Enter a valid amount.');
      return;
    }
    const footprint = Calculator(category, type, value);
    setResult(footprint.toFixed(2));

    // Save activity to Firestore
    if (auth.currentUser) {
      try {
        await addDoc(collection(db, "activities"), {
          userId: auth.currentUser.uid,
          category: category,
          type: type,
          amount: value,
          footprint: footprint,
          timestamp: new Date()
        });
        console.log("Activity saved to database!");
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      alert("Please log in to save your activity.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Carbon Footprint Calculator</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block mb-1">Activity Category:</label>
          <select className="border p-2 w-full" value={category} onChange={(e) => {
            setCategory(e.target.value);
            setType(types[e.target.value][0]);
          }}>
            <option value="travel">Travel</option>
            <option value="food">Food</option>
            <option value="shopping">Shopping</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Activity Type:</label>
          <select className="border p-2 w-full" value={type} onChange={(e) => setType(e.target.value)}>
            {types[category].map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Amount:</label>
          <input type="number" className="border p-2 w-full" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Calculate Footprint
        </button>
      </form>

      {result !== null && (
        <div className="mt-6 p-4 bg-green-100 rounded">
          <h2 className="text-xl font-semibold">Your Estimated Carbon Footprint:</h2>
          <p className="text-lg">{result} kg CO₂</p>
        </div>
      )}
    </div>
  );
}

export default Home;
