// src/components/ChallengeCard.js
import React from 'react';

const ChallengeCard = ({ challenge, onJoin, isJoined, progress }) => {
  const percentage = (progress / challenge.goal) * 100;

  return (
    <div className="p-4 rounded-lg shadow-md bg-gray-100">
      <h3 className="font-semibold text-lg mb-1">{challenge.title}</h3>
      <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
      
      {isJoined ? (
        <>
          <div className="w-full bg-gray-300 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-green-500 h-2.5 rounded-full" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-sm mt-1 text-gray-500">{`${percentage.toFixed(0)}% Progress`}</p>
        </>
      ) : (
        <button 
          onClick={() => onJoin(challenge)} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors"
        >
          Join
        </button>
      )}
    </div>
  );
};

export default ChallengeCard;