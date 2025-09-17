import React from 'react';
import { HomeIcon, ChartBarIcon, UserIcon, ArrowRightOnRectangleIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Home', icon: HomeIcon, path: '/' },
  { name: 'Insights', icon: ChartBarIcon, path: '/insights' },
  { name: 'Achievements', icon: ChartBarIcon, path: '/achievements' },
  { name: 'News', icon: NewspaperIcon, path: '/news' },
  { name: 'Profile', icon: UserIcon, path: '/profile' },
  { name: 'Logout', icon: ArrowRightOnRectangleIcon, path: '/logout' }
];

const BottomTabs = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 w-full flex justify-center bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg rounded-t-lg">
      <div className="flex justify-around items-center h-16 w-full max-w-lg px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className="flex flex-col items-center justify-center p-1 text-center flex-1 min-w-0"
            >
              <Icon 
                className={`h-6 w-6 transition-colors ${isActive ? 'text-green-600' : 'text-gray-500 dark:text-gray-400 hover:text-green-600'}`} 
              />
              <span className={`text-xs mt-1 font-medium transition-colors ${isActive ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabs;