import React, { useState, useEffect, useCallback } from 'react';
import { User, Post, Group, Video, Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../lib/firebaseApi';

interface SearchProps {
  user: User;
}

const Search: React.FC<SearchProps> = ({ user }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts' | 'groups' | 'videos' | 'products'>('all');
  const [results, setResults] = useState<{
    users: User[];
    posts: Post[];
    groups: Group[];
    videos: Video[];
    products: Product[];
  }>({
    users: [],
    posts: [],
    groups: [],
    videos: [],
    products: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'relevance',
    dateRange: 'all',
    category: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Initialize empty results - data will be loaded via search API
  useEffect(() => {
    setResults({ users: [], posts: [], groups: [], videos: [], products: [] });
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    setTimeout(() => {
      if (query.trim()) {
        setIsSearching(true);
        // Simulate API call - ready for backend integration
        setTimeout(() => {
          performSearch(query);
          setIsSearching(false);
        }, 300);
      } else {
        setResults({ users: [], posts: [], groups: [], videos: [], products: [] });
      }
    }, 300),
    [query]
  );

  useEffect(() => {
    const timeoutId = debouncedSearch;
    return () => clearTimeout(timeoutId);
  }, [query, debouncedSearch]);

  const performSearch = async (searchQuery: string) => {
    try {
      const apiResults = await searchApi.search(searchQuery);
      setResults({
        users: (apiResults.users as User[]) ?? [],
        posts: (apiResults.posts as Post[]) ?? [],
        groups: (apiResults.groups as Group[]) ?? [],
        videos: [],
        products: []
      });
    } catch (error) {
      console.error('Search error:', error);
      setResults({ users: [], posts: [], groups: [], videos: [], products: [] });
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handlePostClick = (postId: string) => {
    navigate(`/solutions/${postId}`);
  };

  const getTotalResults = () => {
    return results.users.length + results.posts.length + results.groups.length + 
           results.videos.length + results.products.length;
  };

  const getTabResults = () => {
    switch (activeTab) {
      case 'users': return results.users;
      case 'posts': return results.posts;
      case 'groups': return results.groups;
      case 'videos': return results.videos;
      case 'products': return results.products;
      default: return [...results.users, ...results.posts, ...results.groups, ...results.videos, ...results.products];
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="max-w-[800px] mx-auto p-3 sm:p-4">
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center mb-4 sm:mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-[#1877F2] font-semibold"
          >
            <i className="fa-solid fa-arrow-left text-xl"></i>
            <span>Back</span>
          </button>
        </div>

        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg sm:text-xl"></i>
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-100 pl-12 sm:pl-14 pr-4 sm:pr-5 py-3 sm:py-4 rounded-full outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base sm:text-lg"
            />
            {isSearching && (
              <i className="fa-solid fa-spinner fa-spin absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg"></i>
            )}
          </div>
          
          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 text-gray-600 hover:text-gray-800"
          >
            <i className="fa-solid fa-sliders text-base sm:text-lg"></i>
            <span className="text-sm sm:text-base font-semibold">Filters</span>
          </button>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gray-50 rounded-lg space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm sm:text-base font-semibold mb-2 sm:mb-3">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="w-full border rounded-lg px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base sm:text-lg"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold mb-2 sm:mb-3">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="w-full border rounded-lg px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base sm:text-lg"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold mb-2 sm:mb-3">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full border rounded-lg px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base sm:text-lg"
                >
                  <option value="all">All Categories</option>
                  <option value="technology">Technology</option>
                  <option value="science">Science</option>
                  <option value="math">Mathematics</option>
                  <option value="engineering">Engineering</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6">
          <div className="flex border-b overflow-x-auto scrollbar-hide">
            {(['all', 'users', 'posts', 'groups', 'videos', 'products'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 sm:py-4 px-3 sm:px-5 font-semibold text-sm sm:text-base sm:text-lg capitalize whitespace-nowrap ${
                  activeTab === tab 
                    ? 'border-b-2 border-blue-500 text-blue-500' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab}
                {tab !== 'all' && (
                  <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm bg-gray-200 px-2 sm:px-3 py-1 rounded-full">
                    {results[tab as keyof typeof results]?.length || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {query && (
          <div className="mb-4 sm:mb-6">
            <p className="text-gray-600 text-sm sm:text-base sm:text-lg">
              {getTotalResults()} results for "{query}"
            </p>
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {!query ? (
            <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
              <i className="fa-solid fa-magnifying-glass text-5xl sm:text-7xl text-gray-300 mb-4 sm:mb-6"></i>
              <h2 className="text-xl sm:text-2xl sm:text-3xl font-bold text-gray-700 mb-2 sm:mb-3">Search NexusMind</h2>
              <p className="text-gray-500 text-sm sm:text-base sm:text-lg">Find users, posts, groups, videos, and products</p>
            </div>
          ) : getTotalResults() === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
              <i className="fa-solid fa-face-frown text-5xl sm:text-7xl text-gray-300 mb-4 sm:mb-6"></i>
              <h2 className="text-xl sm:text-2xl sm:text-3xl font-bold text-gray-700 mb-2 sm:mb-3">No results found</h2>
              <p className="text-gray-500 text-sm sm:text-base sm:text-lg">Try different keywords or filters</p>
            </div>
          ) : (
            <>
              {/* Users */}
              {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <h3 className="font-bold text-lg sm:text-xl sm:text-2xl mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <i className="fa-solid fa-users text-blue-500 text-base sm:text-lg sm:text-xl"></i>
                    Users
                    <span className="text-sm sm:text-base font-normal text-gray-500">({results.users.length})</span>
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {results.users.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleUserClick(u.id)}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <img src={u.avatar} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full" alt={u.name} />
                        <div className="flex-1">
                          <p className="font-semibold text-sm sm:text-base sm:text-lg">{u.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500">@{u.username}</p>
                          {u.expertise && u.expertise.length > 0 && (
                            <div className="flex flex-wrap gap-1 sm:gap-2 mt-1.5 sm:mt-2">
                              {u.expertise.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm sm:text-base font-semibold text-blue-500">{u.reputation}</p>
                          <p className="text-xs sm:text-sm text-gray-500">rep</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <h3 className="font-bold text-lg sm:text-xl sm:text-2xl mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <i className="fa-solid fa-newspaper text-green-500 text-base sm:text-lg sm:text-xl"></i>
                    Posts
                    <span className="text-sm sm:text-base font-normal text-gray-500">({results.posts.length})</span>
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {results.posts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handlePostClick(p.id)}
                        className="p-3 sm:p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <img src={p.userAvatar} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" alt="" />
                          <span className="text-sm sm:text-base font-semibold">{p.userName}</span>
                          <span className="text-xs sm:text-sm text-gray-500">• {new Date(p.timestamp).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-semibold text-sm sm:text-base sm:text-lg mb-1.5 sm:mb-2">{p.title}</h4>
                        <p className="text-sm sm:text-base text-gray-600 line-clamp-2">{p.content}</p>
                        <div className="flex items-center gap-3 sm:gap-5 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
                          <span className="flex items-center gap-1 sm:gap-2">
                            <i className="fa-solid fa-arrow-up text-green-500 text-sm sm:text-base"></i>
                            {p.votes}
                          </span>
                          <span className="flex items-center gap-1 sm:gap-2">
                            <i className="fa-solid fa-lightbulb text-yellow-500 text-sm sm:text-base"></i>
                            {p.solutions.length} solutions
                          </span>
                          <span className="bg-gray-200 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm">{p.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Groups */}
              {(activeTab === 'all' || activeTab === 'groups') && results.groups.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <h3 className="font-bold text-lg sm:text-xl sm:text-2xl mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <i className="fa-solid fa-users-rectangle text-purple-500 text-base sm:text-lg sm:text-xl"></i>
                    Groups
                    <span className="text-sm sm:text-base font-normal text-gray-500">({results.groups.length})</span>
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {results.groups.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <img src={g.avatar} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg" alt={g.name} />
                        <div className="flex-1">
                          <p className="font-semibold text-sm sm:text-base sm:text-lg">{g.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">{g.description}</p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">{g.memberCount} members</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {(activeTab === 'all' || activeTab === 'videos') && results.videos.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <h3 className="font-bold text-lg sm:text-xl sm:text-2xl mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <i className="fa-solid fa-video text-red-500 text-base sm:text-lg sm:text-xl"></i>
                    Videos
                    <span className="text-sm sm:text-base font-normal text-gray-500">({results.videos.length})</span>
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {results.videos.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <img src={v.thumbnail} className="w-24 h-16 sm:w-28 sm:h-20 rounded-lg object-cover" alt={v.title} />
                        <div className="flex-1">
                          <p className="font-semibold text-sm sm:text-base sm:text-lg line-clamp-1">{v.title}</p>
                          <p className="text-xs sm:text-sm text-gray-500">{v.userName}</p>
                          <div className="flex items-center gap-3 sm:gap-4 mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500">
                            <span>{v.views} views</span>
                            <span>{v.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {(activeTab === 'all' || activeTab === 'products') && results.products.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <h3 className="font-bold text-lg sm:text-xl sm:text-2xl mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <i className="fa-solid fa-store text-orange-500 text-base sm:text-lg sm:text-xl"></i>
                    Products
                    <span className="text-sm sm:text-base font-normal text-gray-500">({results.products.length})</span>
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {results.products.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <img src={p.images[0]} className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover" alt={p.title} />
                        <div className="flex-1">
                          <p className="font-semibold text-sm sm:text-base sm:text-lg">{p.title}</p>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">{p.description}</p>
                          <p className="text-sm sm:text-base font-bold text-green-600 mt-1.5 sm:mt-2">${p.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
