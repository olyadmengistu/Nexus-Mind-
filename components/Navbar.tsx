
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { icon: 'fa-house', path: '/', label: 'Home' },
    { icon: 'fa-video', path: '/solutions', label: 'Watch' },
    { icon: 'fa-store', path: '/marketplace', label: 'Marketplace' },
    { icon: 'fa-users-viewfinder', path: '/groups', label: 'Groups' },
    { icon: 'fa-gamepad', path: '/gaming', label: 'Gaming' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-[56px] bg-white border-b border-gray-300 shadow-sm z-50 px-4 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center justify-center w-10 h-10 bg-[#1877F2] rounded-lg">
            <i className="fa-solid fa-brain text-white text-xl"></i>
        </Link>
        <div className="relative group hidden sm:block">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
          <input 
            type="text" 
            placeholder="Search NexusMind..." 
            className="bg-[#F0F2F5] pl-10 pr-4 py-2 rounded-full w-[240px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] text-sm"
          />
        </div>
      </div>

      {/* Center - Icons Only */}
      <div className="hidden md:flex items-center h-full gap-2">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={`flex items-center justify-center w-[110px] h-full border-b-4 transition-all ${
              location.pathname === item.path ? 'border-[#1877F2] text-[#1877F2]' : 'border-transparent text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-xl`}></i>
          </Link>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center hover:bg-gray-100 p-1.5 rounded-full cursor-pointer">
            <img src={user.avatar} className="w-7 h-7 rounded-full object-cover mr-2" alt="Avatar" />
            <span className="font-semibold text-sm">{user.name.split(' ')[0]}</span>
        </div>
        <button className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center">
          <i className="fa-solid fa-bars"></i>
        </button>
        <Link to="/messages" className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center">
          <i className="fa-brands fa-facebook-messenger"></i>
        </Link>
        <Link to="/notifications" className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center">
          <i className="fa-solid fa-bell"></i>
        </Link>
        <button 
          onClick={onLogout}
          className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
        >
          <i className="fa-solid fa-caret-down"></i>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
