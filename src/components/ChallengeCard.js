// src/components/ChallengeCard.js
import React, { useEffect, useState } from 'react';

export default function ChallengeCard({ challenge, onJoin }) {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    // Placeholder: in real app, compute progress from Firestore
    setProgress(0);
  }, [challenge]);

  useEffect(() => {
    if (!challenge.startAt || !challenge.endAt) return;
    const end = new Date(challenge.endAt);
    const id = setInterval(() => {
      const now = new Date();
      const diff = end - now;
      setTimeLeft(diff > 0 ? diff : 0);
      if (diff <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [challenge]);

  const fmt = (ms) => {
    if (ms == null) return '';
    const s = Math.floor(ms/1000)%60;
    const m = Math.floor(ms/60000)%60;
    const h = Math.floor(ms/3600000)%24;
    const d = Math.floor(ms/86400000);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="p-4 border rounded shadow-sm bg-white">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{challenge.title}</h3>
        <div className="text-sm text-gray-500">{challenge.goalValue ? `${challenge.goalValue}` : ''}</div>
      </div>
      <p className="text-sm text-gray-600">{challenge.description}</p>
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <small className="text-xs text-gray-500">Progress: {progress}%</small>
          <small className="text-xs text-gray-500">{timeLeft ? fmt(timeLeft) : ''}</small>
        </div>
        <div className="mt-3">
          <button onClick={() => onJoin(challenge)} className="px-3 py-1 bg-blue-600 text-white rounded">Join</button>
        </div>
      </div>
    </div>
  );
}
