
import React from 'react';
import { User } from '../types';
import { Link } from 'react-router-dom';

interface LeftSidebarProps {
  user: User;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ user }) => {
  const items = [
    { icon: 'fa-user-group', label: 'Find Solvers', color: 'text-blue-500' },
    { icon: 'fa-puzzle-piece', label: 'My Challenges', color: 'text-purple-500' },
    { icon: 'fa-ranking-star', label: 'Expert Rankings', color: 'text-yellow-500' },
    { icon: 'fa-layer-group', label: 'Categories', color: 'text-green-500' },
    { icon: 'fa-handshake', label: 'Collaboration Hub', color: 'text-blue-400' },
    { icon: 'fa-box-archive', label: 'Solved Archive', color: 'text-gray-500' },
    { icon: 'fa-book-bookmark', label: 'Saved Methods', color: 'text-red-500' },
    { icon: 'fa-chart-line', label: 'Problem Analytics', color: 'text-blue-600' },
    { icon: 'fa-star', label: 'Success Stories', color: 'text-orange-500' },
    { icon: 'fa-coins', label: 'Funding/Grants', color: 'text-yellow-600' },
    { icon: 'fa-graduation-cap', label: 'Learning Resources', color: 'text-indigo-500' },
    { icon: 'fa-location-dot', label: 'Local Struggles', color: 'text-red-400' },
    { icon: 'fa-people-arrows', label: 'Mentorship', color: 'text-teal-500' },
    { icon: 'fa-lightbulb', label: 'Idea Incubator', color: 'text-yellow-400' },
    { icon: 'fa-circle-info', label: 'Help Center', color: 'text-blue-500' }
  ];

  return (
    <aside className="fixed left-0 top-[56px] bottom-0 w-[280px] overflow-y-auto hidden lg:block p-2">
      <Link to="/profile" className="flex items-center gap-4 p-3 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors mb-2">
        <img src={user.avatar} className="w-11 h-11 rounded-full object-cover" alt="User" />
        <span className="font-semibold text-base">{user.name}</span>
      </Link>

      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
          <div className={`w-11 h-11 flex items-center justify-center text-2xl ${item.color}`}>
            <i className={`fa-solid ${item.icon}`}></i>
          </div>
          <span className="text-base font-semibold">{item.label}</span>
        </div>
      ))}

      <div className="mt-4 pt-4 border-t border-gray-300 px-2 text-xs text-gray-500 space-y-2">
        <p>Privacy · Terms · Advertising · Cookies · Connect.Solve.Grow © 2024</p>
      </div>
    </aside>
  );
};

export default LeftSidebar;
