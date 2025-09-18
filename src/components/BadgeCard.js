// src/components/BadgeCard.js
import React from 'react';

const BadgeCard = ({ badge, earned, claimed }) => {
  const cardClasses = `p-4 rounded-lg shadow-md text-center transition-all duration-300 ease-in-out
    ${earned ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100 border-2 border-gray-300'}
    ${claimed ? 'bg-green-300' : ''}
  `;
  const iconClasses = `text-5xl mb-2 
    ${earned ? 'text-green-600' : 'text-gray-400'}
    ${claimed ? 'animate-bounce' : ''}
  `;

  return (
    <div className={cardClasses}>
      <div className={iconClasses}>
        {/* You can replace this with a real icon library like Heroicons */}
        {badge.icon}
      </div>
      <h3 className="font-semibold text-lg">{badge.title}</h3>
      <p className="text-sm text-gray-600">{badge.description}</p>
      <p className="text-xs mt-2 font-bold">
        {claimed ? "CLAIMED" : earned ? "UNLOCKED" : "LOCKED"}
      </p>
    </div>
  );
};

export default BadgeCard;