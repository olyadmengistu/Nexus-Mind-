
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('nexus_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (searchQuery.trim()) {
      const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
      const query = searchQuery.toLowerCase();
      const results = users.filter((u: User) =>
        u.name.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query)
      );
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nexus_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
          setDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const navItems = [
    { icon: 'fa-house', path: '/', label: 'Home' },
    { icon: 'fa-video', path: '/videos', label: 'Videos' },
    { icon: 'fa-store', path: '/marketplace', label: 'Marketplace' },
    { icon: 'fa-users-viewfinder', path: '/groups', label: 'Groups' },
    { icon: 'fa-handshake', path: '/collaborate', label: 'Collaborate' }
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            onFocus={() => searchQuery && setShowResults(true)}
            className="bg-[#F0F2F5] pl-10 pr-4 py-2 rounded-full w-[240px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] text-sm"
          />
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
              {searchResults.map((resultUser) => (
                <Link
                  key={resultUser.id}
                  to={`/profile/${resultUser.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setSearchQuery('');
                    setShowResults(false);
                  }}
                >
                  <img 
                    src={resultUser.avatar} 
                    alt={resultUser.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm">{resultUser.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
            <span className="font-semibold text-sm">{user.name}</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
        <Link to="/messages" className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center">
          <i className="fa-brands fa-facebook-messenger"></i>
        </Link>
        <Link to="/notifications" className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center">
          <i className="fa-solid fa-bell"></i>
        </Link>
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
          >
            <i className="fa-solid fa-caret-down"></i>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="Avatar" />
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </div>
              </div>
              <div className="py-1">
                <Link 
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  <i className="fa-solid fa-user text-gray-600 w-5"></i>
                  <span className="text-sm">Your Profile</span>
                </Link>
                <button 
                  onClick={() => {
                    toggleDarkMode();
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors w-full text-left"
                >
                  <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'} text-gray-600 w-5`}></i>
                  <span className="text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button 
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors w-full text-left"
                >
                  <i className="fa-solid fa-gear text-gray-600 w-5"></i>
                  <span className="text-sm">Settings</span>
                </button>
                <button 
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors w-full text-left"
                >
                  <i className="fa-solid fa-circle-question text-gray-600 w-5"></i>
                  <span className="text-sm">Help & Support</span>
                </button>
                <div className="border-t border-gray-200 mt-1 pt-1">
                  <button 
                    onClick={() => {
                      onLogout();
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors w-full text-left text-red-600"
                  >
                    <i className="fa-solid fa-right-from-bracket w-5"></i>
                    <span className="text-sm">Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-lg transform transition-transform">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Link to="/" className="flex items-center justify-center w-10 h-10 bg-[#1877F2] rounded-lg">
                    <i className="fa-solid fa-brain text-white text-xl"></i>
                  </Link>
                  <span className="font-bold text-xl text-[#1877F2]">NexusMind</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full"
                >
                  <i className="fa-solid fa-xmark text-gray-600"></i>
                </button>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" alt="Avatar" />
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
            </div>
            <nav className="p-4">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.path 
                        ? 'bg-[#1877F2] text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <i className={`fa-solid ${item.icon} w-6 text-center`}></i>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname.startsWith('/profile') 
                      ? 'bg-[#1877F2] text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <i className="fa-solid fa-user w-6 text-center"></i>
                  <span className="font-medium">Profile</span>
                </Link>
                <Link
                  to="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/messages' 
                      ? 'bg-[#1877F2] text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <i className="fa-brands fa-facebook-messenger w-6 text-center"></i>
                  <span className="font-medium">Messages</span>
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/notifications' 
                      ? 'bg-[#1877F2] text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <i className="fa-solid fa-bell w-6 text-center"></i>
                  <span className="font-medium">Notifications</span>
                </Link>
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4">
                <button
                  onClick={() => {
                    toggleDarkMode();
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                >
                  <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'} w-6 text-center`}></i>
                  <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-gear w-6 text-center"></i>
                  <span className="font-medium">Settings</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-circle-question w-6 text-center"></i>
                  <span className="font-medium">Help & Support</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-100 rounded-lg transition-colors text-red-600"
                >
                  <i className="fa-solid fa-right-from-bracket w-6 text-center"></i>
                  <span className="font-medium">Log Out</span>
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
