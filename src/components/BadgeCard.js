// src/components/BadgeCard.js
import React from 'react';

export default function BadgeCard({ badge, earned }) {
  return (
    <div className={`p-4 border rounded shadow-sm transform transition duration-300 ${earned ? 'bg-green-50 scale-100' : 'bg-white opacity-80 hover:scale-105'}`}>
      <div className={`text-3xl ${earned ? 'animate-bounce' : ''}`}>{badge.icon}</div>
      <h3 className="font-semibold">{badge.title}</h3>
      <p className="text-sm text-gray-600">{badge.description}</p>
      {earned ? (
        <p className="text-xs text-green-700 mt-2">Earned</p>
      ) : (
        <p className="text-xs text-gray-500 mt-2">Locked</p>
      )}
    </div>
  );
}
