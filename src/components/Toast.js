import React from 'react';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-24 right-6 bg-gray-800 text-white px-4 py-2 rounded shadow">
      {message}
    </div>
  );
}