
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Notification } from '../types';
import { searchUsers, debounce } from '../lib/searchApi';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  isVisible?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, isVisible = true }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim()) {
        setIsSearching(true);
        try {
          const response = await searchUsers({ query, limit: 10 });
          setSearchResults(response.data);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen) {
        const target = event.target as HTMLElement;
        const dropdown = document.querySelector('.dropdown-container');
        if (dropdown && !dropdown.contains(target)) {
          setDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Load unread notification count
  useEffect(() => {
    const stored = localStorage.getItem('nexus_notifications');
    if (stored) {
      const notifications: Notification[] = JSON.parse(stored);
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    }
  }, [location]); // Reload when location changes to update count after viewing notifications


  const navItems = [
    { icon: 'fa-house', path: '/', label: 'Home' },
    { icon: 'fa-video', path: '/videos', label: 'Videos' },
    { icon: 'fa-store', path: '/marketplace', label: 'Marketplace' },
    { icon: 'fa-users-viewfinder', path: '/groups', label: 'Groups' },
    { icon: 'fa-handshake', path: '/collaborate', label: 'Collaborate' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 h-[52px] sm:h-[56px] bg-white border-b border-gray-300 shadow-sm z-50 px-2 sm:px-4 flex items-center justify-between transition-transform duration-300 md:translate-y-0 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      {/* Left */}
      <div className="flex items-center gap-1.5 sm:gap-2 sm:gap-3">
        <Link to="/" className="flex items-center justify-center w-9 h-9 sm:w-10 sm:w-12 sm:h-10 sm:h-12 bg-[#1877F2] rounded-xl">
            <i className="fa-solid fa-brain text-white text-lg sm:text-xl sm:text-2xl"></i>
        </Link>
        {/* Search bar - desktop only */}
        <div className="relative group hidden sm:block">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
          <input
            type="text"
            placeholder="Search NexusMind..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            onFocus={() => searchQuery && setShowResults(true)}
            className="bg-[#F0F2F5] pl-12 pr-5 py-3 rounded-full w-[280px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] text-base"
          />
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((resultUser) => (
                  <Link
                    key={resultUser.id}
                    to={`/profile/${resultUser.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setSearchQuery('');
                      setShowResults(false);
                    }}
                  >
                    <img
                      src={resultUser.avatar}
                      alt={resultUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-base">{resultUser.name}</p>
                      <p className="text-sm text-gray-500">@{resultUser.username}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center - Icons Only (desktop) */}
      <div className="hidden lg:flex items-center h-full gap-1 xl:gap-2">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={`flex items-center justify-center w-[88px] xl:w-[140px] h-full border-b-4 transition-all ${
              location.pathname === item.path ? 'border-[#1877F2] text-[#1877F2]' : 'border-transparent text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-2xl`}></i>
          </Link>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search icon - mobile only */}
        <Link 
          to="/search" 
          className="flex sm:hidden w-9 h-9 bg-gray-200 hover:bg-gray-300 rounded-full items-center justify-center"
        >
          <i className="fa-solid fa-magnifying-glass text-lg"></i>
        </Link>
        {/* Menu button - mobile only */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex sm:hidden w-9 h-9 bg-gray-200 hover:bg-gray-300 rounded-full items-center justify-center"
        >
          <i className="fa-solid fa-bars text-lg"></i>
        </button>
        {/* Messages */}
        <Link to="/messages" className="w-9 h-9 sm:w-10 sm:w-12 sm:h-10 sm:h-12 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center">
          <i className="fa-brands fa-facebook-messenger text-lg sm:text-xl"></i>
        </Link>
        {/* Notifications */}
        <Link to="/notifications" className="relative w-9 h-9 sm:w-10 sm:w-12 sm:h-10 sm:h-12 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center">
          <i className="fa-solid fa-bell text-lg sm:text-xl"></i>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        {/* Feedback - desktop only */}
        <Link to="/feedback" className="hidden sm:flex w-10 sm:w-12 h-10 sm:h-12 bg-gray-200 hover:bg-gray-300 rounded-full items-center justify-center">
          <i className="fa-solid fa-comment-dots text-lg sm:text-xl"></i>
        </Link>
        {/* Profile */}
        <div className="relative dropdown-container">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative w-9 h-9 sm:w-10 sm:w-12 sm:h-10 sm:h-12 rounded-full flex items-center justify-center"
          >
            <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="Avatar" />
            <div className="absolute bottom-0 right-0 bg-gray-600 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
              <i className="fa-solid fa-caret-down text-white text-[10px] sm:text-sm"></i>
            </div>
          </button>
          {dropdownOpen && (
            <div className="fixed left-2 right-2 top-[60px] max-h-[calc(100vh-76px)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-4">
                  <img src={user.avatar} className="w-16 h-16 rounded-full object-cover border-3 border-blue-500" alt="Avatar" />
                  <div>
                    <p className="font-bold text-lg">{user.name}</p>
                    <p className="text-base text-gray-600">@{user.username}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full">{user.reputation} Rep</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="py-3 max-h-[500px] overflow-y-auto">
                <div className="px-4 py-3">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Account</p>
                  <Link 
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-user text-blue-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">Your Profile</span>
                  </Link>
                  <Link 
                    to="/saved-posts"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-bookmark text-blue-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">Saved Posts</span>
                  </Link>
                  <Link 
                    to="/activity-log"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-clock-rotate-left text-blue-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">Activity Log</span>
                  </Link>
                </div>
                
                <div className="px-4 py-3 border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Settings</p>
                  <Link 
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-gear text-gray-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">Settings</span>
                  </Link>
                  <Link 
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-shield-halved text-gray-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">Privacy Settings</span>
                  </Link>
                  <Link 
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-bell text-gray-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">Notification Settings</span>
                  </Link>
                  <Link 
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-language text-gray-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">Language</span>
                  </Link>
                  <Link 
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-universal-access text-gray-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">Accessibility</span>
                  </Link>
                </div>

                <div className="px-4 py-3 border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Support</p>
                  <Link 
                    to="/feedback"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-comment-dots text-gray-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">Send Feedback</span>
                  </Link>
                  <Link 
                    to="/help"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-circle-question text-gray-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">Help & Support</span>
                  </Link>
                  {(user.email === 'admin@nexusmind.com' || user.email?.includes('admin')) && (
                    <Link 
                      to="/admin/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-4 px-4 py-4 hover:bg-blue-50 rounded-xl transition-colors text-blue-600"
                    >
                      <i className="fa-solid fa-chart-line w-6 text-lg"></i>
                      <span className="text-base font-medium">Admin Dashboard</span>
                    </Link>
                  )}
                  <Link 
                    to="/help"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-triangle-exclamation text-gray-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">Report a Problem</span>
                  </Link>
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      alert('Terms of Service: By using NexusMind, you agree to our terms. Full terms available at nexusmind.com/terms');
                    }}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors w-full text-left"
                  >
                    <i className="fa-solid fa-file-lines text-gray-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">Terms of Service</span>
                  </button>
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      alert('Privacy Policy: We respect your privacy. Full policy available at nexusmind.com/privacy');
                    }}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors w-full text-left"
                  >
                    <i className="fa-solid fa-lock text-gray-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">Privacy Policy</span>
                  </button>
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      alert('About NexusMind: Version 1.0.0 - A social platform for collaboration and innovation.');
                    }}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors w-full text-left"
                  >
                    <i className="fa-solid fa-info-circle text-gray-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">About</span>
                  </button>
                </div>

                <div className="px-4 py-3 border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Account Actions</p>
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
                      if (users.length > 1) {
                        alert('Switch account feature: Select from your saved accounts');
                      } else {
                        alert('No other accounts available. Sign up with a new account to switch.');
                      }
                    }}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl transition-colors w-full text-left"
                  >
                    <i className="fa-solid fa-users text-gray-600 w-6 text-lg"></i>
                    <span className="text-base font-medium">Switch Account</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        setDropdownOpen(false);
                        // Remove user from localStorage
                        const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
                        const updatedUsers = users.filter((u: any) => u.id !== user.id);
                        localStorage.setItem('nexus_users', JSON.stringify(updatedUsers));
                        localStorage.removeItem('nexus_current_user');
                        onLogout();
                        alert('Account deleted successfully.');
                      }
                    }}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-red-50 rounded-xl transition-colors w-full text-left text-red-600"
                  >
                    <i className="fa-solid fa-trash w-6 text-lg"></i>
                    <span className="text-base font-medium">Delete Account</span>
                  </button>
                </div>

                <div className="border-t border-gray-200 mt-2 pt-3 px-4">
                  <button 
                    onClick={() => {
                      onLogout();
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-red-50 rounded-xl transition-colors w-full text-left text-red-600 font-medium"
                  >
                    <i className="fa-solid fa-right-from-bracket w-6 text-lg"></i>
                    <span className="text-base">Log Out</span>
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
          <div className="fixed top-0 left-0 h-full w-[86vw] max-w-80 bg-white z-50 shadow-lg transform transition-transform">
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
            <nav className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-2">Revenue & Monetization</p>
                
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-rectangle-ad w-8 text-center text-purple-600 text-xl"></i>
                  <span className="font-bold text-lg">Ads</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-hand-holding-dollar w-8 text-center text-green-600 text-xl"></i>
                  <span className="font-bold text-lg">Sponsors</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-sack-dollar w-8 text-center text-yellow-600 text-xl"></i>
                  <span className="font-bold text-lg">Investors</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-coins w-8 text-center text-orange-600 text-xl"></i>
                  <span className="font-bold text-lg">Funding</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-crown w-8 text-center text-amber-600 text-xl"></i>
                  <span className="font-bold text-lg">Premium</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-circle-check w-8 text-center text-blue-600 text-xl"></i>
                  <span className="font-bold text-lg">Verification</span>
                </button>
                
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4 mt-4">Business & Growth</p>
                
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-building w-8 text-center text-indigo-600 text-xl"></i>
                  <span className="font-bold text-lg">Business Pages</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-briefcase w-8 text-center text-slate-600 text-xl"></i>
                  <span className="font-bold text-lg">Jobs</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-shop w-8 text-center text-pink-600 text-xl"></i>
                  <span className="font-bold text-lg">Marketplace</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-video w-8 text-center text-red-600 text-xl"></i>
                  <span className="font-bold text-lg">Creator Hub</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-handshake-simple w-8 text-center text-teal-600 text-xl"></i>
                  <span className="font-bold text-lg">Brand Deals</span>
                </button>
                
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4 mt-4">Financial & Analytics</p>
                
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-wallet w-8 text-center text-emerald-600 text-xl"></i>
                  <span className="font-bold text-lg">Wallet</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-chart-line w-8 text-center text-cyan-600 text-xl"></i>
                  <span className="font-bold text-lg">Analytics</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-robot w-8 text-center text-violet-600 text-xl"></i>
                  <span className="font-bold text-lg">AI Tools</span>
                </button>
                
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4 mt-4">Community & Engagement</p>
                
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-users w-8 text-center text-blue-500 text-xl"></i>
                  <span className="font-bold text-lg">Communities</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-calendar-days w-8 text-center text-rose-600 text-xl"></i>
                  <span className="font-bold text-lg">Events</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-graduation-cap w-8 text-center text-fuchsia-600 text-xl"></i>
                  <span className="font-bold text-lg">Courses</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-rocket w-8 text-center text-lime-600 text-xl"></i>
                  <span className="font-bold text-lg">Boost</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-link w-8 text-center text-sky-600 text-xl"></i>
                  <span className="font-bold text-lg">Affiliate</span>
                </button>
                
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4 mt-4">Platform & Development</p>
                
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-code w-8 text-center text-gray-700 text-xl"></i>
                  <span className="font-bold text-lg">Developers</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-mobile-screen w-8 text-center text-stone-600 text-xl"></i>
                  <span className="font-bold text-lg">App Store</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-building-columns w-8 text-center text-neutral-600 text-xl"></i>
                  <span className="font-bold text-lg">Enterprise</span>
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-5 px-6 py-5 w-full hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                >
                  <i className="fa-solid fa-flask w-8 text-center text-zinc-600 text-xl"></i>
                  <span className="font-bold text-lg">Research</span>
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
