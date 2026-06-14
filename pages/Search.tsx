import React, { useState, useEffect, useCallback } from 'react';
import { User, Post, Group, Video, Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../lib/api';

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

  // Load data from localStorage for search
  useEffect(() => {
    const loadSearchData = () => {
      const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
      const posts = JSON.parse(localStorage.getItem('nexus_posts') || '[]');
      const groups = JSON.parse(localStorage.getItem('nexus_groups') || '[]');
      const videos = JSON.parse(localStorage.getItem('nexus_videos') || '[]');
      const products = JSON.parse(localStorage.getItem('nexus_products') || '[]');
      
      setResults({ users, posts, groups, videos, products });
    };
    
    loadSearchData();
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
    const q = searchQuery.toLowerCase();

    try {
      const apiResults = await searchApi.globalSearch(searchQuery);
      setResults({
        users: (apiResults.users as User[]) ?? [],
        posts: (apiResults.posts as Post[]) ?? [],
        groups: (apiResults.groups as Group[]) ?? [],
        videos: (apiResults.videos as Video[]) ?? [],
        products: (apiResults.products as Product[]) ?? [],
      });
      return;
    } catch (error) {
      console.warn('Backend search unavailable, using local data:', error);
    }

    const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
    const posts = JSON.parse(localStorage.getItem('nexus_posts') || '[]');
    const groups = JSON.parse(localStorage.getItem('nexus_groups') || '[]');
    const videos = JSON.parse(localStorage.getItem('nexus_videos') || '[]');
    const products = JSON.parse(localStorage.getItem('nexus_products') || '[]');

    const filteredUsers = users.filter((u: User) =>
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.bio?.toLowerCase().includes(q) ||
      u.expertise?.some(skill => skill.toLowerCase().includes(q))
    );

    const filteredPosts = posts.filter((p: Post) =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );

    const filteredGroups = groups.filter((g: Group) =>
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q)
    );

    const filteredVideos = videos.filter((v: Video) =>
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.tags.some(tag => tag.toLowerCase().includes(q))
    );

    const filteredProducts = products.filter((p: Product) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );

    setResults({
      users: filteredUsers,
      posts: filteredPosts,
      groups: filteredGroups,
      videos: filteredVideos,
      products: filteredProducts
    });
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
      <div className="max-w-[800px] mx-auto p-4">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
            <input
              type="text"
              placeholder="Search NexusMind"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-100 pl-12 pr-4 py-3 rounded-full outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
            {isSearching && (
              <i className="fa-solid fa-spinner fa-spin absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            )}
          </div>
          
          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-3 flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <i className="fa-solid fa-sliders"></i>
            <span className="text-sm font-semibold">Filters</span>
          </button>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
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
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="flex border-b">
            {(['all', 'users', 'posts', 'groups', 'videos', 'products'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 font-semibold text-sm capitalize ${
                  activeTab === tab 
                    ? 'border-b-2 border-blue-500 text-blue-500' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab}
                {tab !== 'all' && (
                  <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                    {results[tab as keyof typeof results]?.length || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {query && (
          <div className="mb-4">
            <p className="text-gray-600">
              {getTotalResults()} results for "{query}"
            </p>
          </div>
        )}

        <div className="space-y-4">
          {!query ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <i className="fa-solid fa-magnifying-glass text-6xl text-gray-300 mb-4"></i>
              <h2 className="text-xl font-bold text-gray-700 mb-2">Search NexusMind</h2>
              <p className="text-gray-500">Find users, posts, groups, videos, and products</p>
            </div>
          ) : getTotalResults() === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <i className="fa-solid fa-face-frown text-6xl text-gray-300 mb-4"></i>
              <h2 className="text-xl font-bold text-gray-700 mb-2">No results found</h2>
              <p className="text-gray-500">Try different keywords or filters</p>
            </div>
          ) : (
            <>
              {/* Users */}
              {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-users text-blue-500"></i>
                    Users
                    <span className="text-sm font-normal text-gray-500">({results.users.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {results.users.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleUserClick(u.id)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <img src={u.avatar} className="w-12 h-12 rounded-full" alt={u.name} />
                        <div className="flex-1">
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-sm text-gray-500">@{u.username}</p>
                          {u.expertise && u.expertise.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {u.expertise.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-500">{u.reputation}</p>
                          <p className="text-xs text-gray-500">reputation</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-newspaper text-green-500"></i>
                    Posts
                    <span className="text-sm font-normal text-gray-500">({results.posts.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {results.posts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handlePostClick(p.id)}
                        className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <img src={p.userAvatar} className="w-6 h-6 rounded-full" alt="" />
                          <span className="text-sm font-semibold">{p.userName}</span>
                          <span className="text-xs text-gray-500">• {new Date(p.timestamp).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-semibold mb-1">{p.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{p.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <i className="fa-solid fa-arrow-up text-green-500"></i>
                            {p.votes}
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="fa-solid fa-lightbulb text-yellow-500"></i>
                            {p.solutions.length} solutions
                          </span>
                          <span className="bg-gray-200 px-2 py-0.5 rounded text-xs">{p.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Groups */}
              {(activeTab === 'all' || activeTab === 'groups') && results.groups.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-users-rectangle text-purple-500"></i>
                    Groups
                    <span className="text-sm font-normal text-gray-500">({results.groups.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {results.groups.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <img src={g.avatar} className="w-12 h-12 rounded-lg" alt={g.name} />
                        <div className="flex-1">
                          <p className="font-semibold">{g.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{g.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{g.memberCount} members</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {(activeTab === 'all' || activeTab === 'videos') && results.videos.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-video text-red-500"></i>
                    Videos
                    <span className="text-sm font-normal text-gray-500">({results.videos.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {results.videos.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <img src={v.thumbnail} className="w-24 h-16 rounded-lg object-cover" alt={v.title} />
                        <div className="flex-1">
                          <p className="font-semibold line-clamp-1">{v.title}</p>
                          <p className="text-sm text-gray-500">{v.userName}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
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
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-store text-orange-500"></i>
                    Products
                    <span className="text-sm font-normal text-gray-500">({results.products.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {results.products.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <img src={p.images[0]} className="w-16 h-16 rounded-lg object-cover" alt={p.title} />
                        <div className="flex-1">
                          <p className="font-semibold">{p.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{p.description}</p>
                          <p className="text-sm font-bold text-green-600 mt-1">${p.price}</p>
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
