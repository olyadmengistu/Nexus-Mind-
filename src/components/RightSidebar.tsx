
import React, { useState, useEffect } from 'react';
import { Contact, SponsoredContent, Post, Solution } from '../types';
import { postsApi } from '../lib/firebaseApi';

const RightSidebar: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Sarah Chen', status: 'online', avatar: 'https://picsum.photos/seed/sarah/50/50', username: 'sarahchen' },
    { id: '2', name: 'John Doe', status: 'offline', avatar: 'https://picsum.photos/seed/john/50/50', username: 'johndoe' },
    { id: '3', name: 'Alex River', status: 'online', avatar: 'https://picsum.photos/seed/alex/50/50', username: 'alexriver' },
    { id: '4', name: 'Maria Lopez', status: 'online', avatar: 'https://picsum.photos/seed/maria/50/50', username: 'marialopez' },
    { id: '5', name: 'Tom Hardy', status: 'offline', avatar: 'https://picsum.photos/seed/tom/50/50', username: 'tomhardy' }
  ]);
  const [trendingSolutions, setTrendingSolutions] = useState<{ post: Post; solution: Solution }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [sponsoredItems, setSponsoredItems] = useState<SponsoredContent[]>([
    {
      id: '1',
      title: 'Solved: Global Warming?',
      description: 'Join the global initiative to combat climate change through innovative solutions',
      imageUrl: 'https://picsum.photos/seed/ad1/150/150',
      sponsorName: 'nexusmind.org',
      sponsorUrl: 'https://nexusmind.org',
      category: 'Environment',
      ctaText: 'Learn More',
      ctaUrl: 'https://nexusmind.org/climate',
      startDate: Date.now(),
      endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      clicks: 1250,
      impressions: 15000,
      isSaved: false,
      tags: ['climate', 'environment', 'innovation']
    },
    {
      id: '2',
      title: 'New Startup Grant 2024',
      description: 'Apply for $50,000 in funding for your innovative startup idea',
      imageUrl: 'https://picsum.photos/seed/ad2/150/150',
      sponsorName: 'grants.com',
      sponsorUrl: 'https://grants.com',
      category: 'Business',
      ctaText: 'Apply Now',
      ctaUrl: 'https://grants.com/apply',
      startDate: Date.now(),
      endDate: Date.now() + 60 * 24 * 60 * 60 * 1000,
      clicks: 890,
      impressions: 12000,
      isSaved: false,
      tags: ['startup', 'funding', 'business']
    }
  ]);
  const [selectedSponsored, setSelectedSponsored] = useState<SponsoredContent | null>(null);
  const [showSponsoredModal, setShowSponsoredModal] = useState(false);

  // Load trending solutions on mount
  useEffect(() => {
    const loadTrendingSolutions = async () => {
      try {
        const posts = await postsApi.getPosts({ limit: 50 });
        // Flatten all solutions from all posts and sort by helpful votes
        const allSolutions: { post: Post; solution: Solution }[] = [];
        
        posts.forEach((post: Post) => {
          if (post.solutions && post.solutions.length > 0) {
            post.solutions.forEach((solution: Solution) => {
              allSolutions.push({ post, solution });
            });
          }
        });
        
        // Sort by helpful votes (descending) and take top 5
        const sorted = allSolutions
          .sort((a, b) => (b.solution.helpful || 0) - (a.solution.helpful || 0))
          .slice(0, 5);
        
        setTrendingSolutions(sorted);
      } catch (error) {
        console.error('Error loading trending solutions:', error);
        // Fallback to mock data if API fails
        setTrendingSolutions([]);
      }
    };
    
    loadTrendingSolutions();
  }, []);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle video call initiation
  const handleVideoCall = (contact: Contact) => {
    alert(`Video call with ${contact.name} - Backend integration ready`);
  };

  // Handle contact click - open conversation
  const handleContactClick = (contact: Contact) => {
    alert(`Opening conversation with ${contact.name} - Backend integration ready`);
  };

  // Handle search toggle
  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    setSearchQuery('');
  };

  // Handle menu toggle
  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  // Menu options for contacts
  const menuOptions = [
    { label: 'View Profile', action: () => {} },
    { label: 'Send Message', action: () => {} },
    { label: 'Block Contact', action: () => {} },
    { label: 'Remove Contact', action: () => {} }
  ];

  // Handle menu option click
  const handleMenuOption = (option: string) => {
    alert(`${option} - Backend integration ready`);
    setShowMenu(false);
  };

  // Handle sponsored item click - track click and open details
  const handleSponsoredClick = (item: SponsoredContent) => {
    setSponsoredItems(prev => prev.map(sponsored => 
      sponsored.id === item.id 
        ? { ...sponsored, clicks: sponsored.clicks + 1 }
        : sponsored
    ));
    setSelectedSponsored(item);
    setShowSponsoredModal(true);
  };

  // Handle sponsored CTA click
  const handleSponsoredCTA = (item: SponsoredContent) => {
    if (item.ctaUrl) {
      window.open(item.ctaUrl, '_blank');
    }
  };

  // Handle save sponsored item
  const handleSaveSponsored = (item: SponsoredContent) => {
    setSponsoredItems(prev => prev.map(sponsored => 
      sponsored.id === item.id 
        ? { ...sponsored, isSaved: !sponsored.isSaved }
        : sponsored
    ));
    alert(`${item.isSaved ? 'Removed from' : 'Added to'} saved items - Backend integration ready`);
  };

  // Handle share sponsored item
  const handleShareSponsored = (item: SponsoredContent) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: item.sponsorUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${item.title} - ${item.sponsorUrl}`);
      alert('Link copied to clipboard - Backend integration ready');
    }
  };

  // Handle report sponsored item
  const handleReportSponsored = (item: SponsoredContent) => {
    const reason = prompt('Please provide a reason for reporting this sponsored content:');
    if (reason) {
      alert(`Report submitted for "${item.title}" - Backend integration ready`);
    }
  };

  // Handle view sponsor profile
  const handleViewSponsor = (item: SponsoredContent) => {
    window.open(item.sponsorUrl, '_blank');
  };

  return (
    <aside className="fixed right-0 top-[56px] bottom-0 w-[300px] overflow-y-auto hidden xl:block p-4">
      {/* Sponsored */}
      <section className="mb-6">
        <h3 className="text-gray-500 font-bold text-lg mb-3">Sponsored</h3>
        <div className="space-y-4">
          {sponsoredItems.map((item) => (
            <div 
              key={item.id} 
              className="relative group"
            >
              <div 
                className="flex items-center gap-4 cursor-pointer hover:bg-gray-200 p-3 rounded-xl transition-colors"
                onClick={() => handleSponsoredClick(item)}
              >
                <img src={item.imageUrl} className="w-[120px] h-[120px] object-cover rounded-lg" alt={item.title} />
                <div className="flex-1">
                  <p className="font-bold text-base">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.sponsorName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{item.category}</span>
                    {item.isSaved && (
                      <i className="fa-solid fa-bookmark text-blue-500 text-xs"></i>
                    )}
                  </div>
                </div>
              </div>
              {/* Action buttons on hover */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-md p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveSponsored(item);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  title={item.isSaved ? 'Remove from saved' : 'Save'}
                >
                  <i className={`fa-solid fa-bookmark ${item.isSaved ? 'text-blue-500' : 'text-gray-500'} text-sm`}></i>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareSponsored(item);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  title="Share"
                >
                  <i className="fa-solid fa-share text-gray-500 text-sm"></i>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReportSponsored(item);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  title="Report"
                >
                  <i className="fa-solid fa-flag text-gray-500 text-sm"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Solutions */}
      <section className="mb-6 pt-4 border-t border-gray-300">
        <h3 className="text-gray-500 font-bold text-lg mb-3">Trending Solutions</h3>
        <div className="space-y-3">
          {trendingSolutions.length > 0 ? (
            trendingSolutions.map(({ post, solution }) => (
              <div 
                key={solution.id} 
                className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-200 rounded-xl transition-colors"
                onClick={() => window.location.hash = `/solutions/${post.id}`}
              >
                <div className="relative">
                  <img src={solution.userAvatar} className="w-12 h-12 rounded-full object-cover" alt={solution.userName} />
                  <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white p-1 rounded-full border-2 border-white text-xs">
                    <i className="fa-solid fa-lightbulb"></i>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold truncate">{solution.text.substring(0, 40)}{solution.text.length > 40 ? '...' : ''}</p>
                  <p className="text-sm text-gray-500">by {solution.userName} · {solution.helpful || 0} helpful</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No trending solutions yet
            </div>
          )}
        </div>
      </section>

      {/* Contacts */}
      <section className="pt-4 border-t border-gray-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-500 font-bold text-lg">Contacts</h3>
          <div className="flex gap-4 text-gray-500">
            <i 
              className="fa-solid fa-video text-xl cursor-pointer hover:text-gray-700" 
              onClick={() => handleVideoCall(selectedContact || contacts[0])}
              title="Start Video Call"
            ></i>
            <i 
              className="fa-solid fa-magnifying-glass text-xl cursor-pointer hover:text-gray-700" 
              onClick={handleSearchToggle}
              title="Search Contacts"
            ></i>
            <div className="relative">
              <i 
                className="fa-solid fa-ellipsis text-xl cursor-pointer hover:text-gray-700" 
                onClick={handleMenuToggle}
                title="More Options"
              ></i>
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg border border-gray-200 py-2 w-48 z-50">
                  {menuOptions.map((option, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleMenuOption(option.label)}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Search Input */}
        {showSearch && (
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        
        {/* Contacts List */}
        <div className="space-y-1">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div 
                key={contact.id} 
                className="flex items-center gap-4 p-3 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors relative group"
                onClick={() => handleContactClick(contact)}
                onMouseEnter={() => setSelectedContact(contact)}
              >
                <div className="relative">
                  <img src={contact.avatar} className="w-11 h-11 rounded-full" alt={contact.name} />
                  {contact.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                  {contact.status === 'away' && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-yellow-500 border-2 border-white rounded-full"></div>
                  )}
                  {contact.status === 'busy' && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-base font-bold block">{contact.name}</span>
                  {contact.username && (
                    <span className="text-sm text-gray-500">@{contact.username}</span>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <i 
                    className="fa-solid fa-video text-gray-500 hover:text-blue-500 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVideoCall(contact);
                    }}
                    title="Video Call"
                  ></i>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No contacts found
            </div>
          )}
        </div>
      </section>

      {/* Sponsored Detail Modal */}
      {showSponsoredModal && selectedSponsored && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img 
                src={selectedSponsored.imageUrl} 
                alt={selectedSponsored.title} 
                className="w-full h-48 object-cover rounded-t-2xl"
              />
              <button
                onClick={() => setShowSponsoredModal(false)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              >
                <i className="fa-solid fa-xmark text-gray-700"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">{selectedSponsored.title}</h2>
                  <p 
                    className="text-blue-600 hover:underline cursor-pointer text-sm"
                    onClick={() => handleViewSponsor(selectedSponsored)}
                  >
                    {selectedSponsored.sponsorName}
                  </p>
                </div>
                <button
                  onClick={() => handleSaveSponsored(selectedSponsored)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title={selectedSponsored.isSaved ? 'Remove from saved' : 'Save'}
                >
                  <i className={`fa-solid fa-bookmark ${selectedSponsored.isSaved ? 'text-blue-500' : 'text-gray-500'} text-xl`}></i>
                </button>
              </div>
              
              <p className="text-gray-700 mb-4">{selectedSponsored.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{selectedSponsored.category}</span>
                {selectedSponsored.tags?.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span><i className="fa-solid fa-eye mr-1"></i>{selectedSponsored.impressions.toLocaleString()} views</span>
                <span><i className="fa-solid fa-mouse-pointer mr-1"></i>{selectedSponsored.clicks.toLocaleString()} clicks</span>
              </div>
              
              <div className="flex gap-3">
                {selectedSponsored.ctaText && selectedSponsored.ctaUrl && (
                  <button
                    onClick={() => handleSponsoredCTA(selectedSponsored)}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    {selectedSponsored.ctaText}
                  </button>
                )}
                <button
                  onClick={() => handleShareSponsored(selectedSponsored)}
                  className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  title="Share"
                >
                  <i className="fa-solid fa-share text-gray-700"></i>
                </button>
                <button
                  onClick={() => handleReportSponsored(selectedSponsored)}
                  className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  title="Report"
                >
                  <i className="fa-solid fa-flag text-gray-700"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;
