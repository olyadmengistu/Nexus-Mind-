import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BottomNavProps {
  isVisible?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ isVisible = true }) => {
  const location = useLocation();
  const items = [
    { icon: 'fa-house', path: '/', label: 'Home' },
    { icon: 'fa-video', path: '/videos', label: 'Videos' },
    { icon: 'fa-store', path: '/marketplace', label: 'Marketplace' },
    { icon: 'fa-users-viewfinder', path: '/groups', label: 'Groups' },
    { icon: 'fa-handshake', path: '/collaborate', label: 'Collaborate' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="mx-auto flex h-16 max-w-[680px] items-center justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition-colors ${
                isActive ? 'text-[#1877F2]' : 'text-gray-500'
              }`}
              aria-label={item.label}
            >
              <i className={`fa-solid ${item.icon} text-xl`}></i>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
