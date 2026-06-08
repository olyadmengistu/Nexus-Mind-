
import React, { useState, useEffect } from 'react';
import { Contact } from '../types';

const RightSidebar: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Sarah Chen', status: 'online', avatar: 'https://picsum.photos/seed/sarah/50/50', username: 'sarahchen' },
    { id: '2', name: 'John Doe', status: 'offline', avatar: 'https://picsum.photos/seed/john/50/50', username: 'johndoe' },
    { id: '3', name: 'Alex River', status: 'online', avatar: 'https://picsum.photos/seed/alex/50/50', username: 'alexriver' },
    { id: '4', name: 'Maria Lopez', status: 'online', avatar: 'https://picsum.photos/seed/maria/50/50', username: 'marialopez' },
    { id: '5', name: 'Tom Hardy', status: 'offline', avatar: 'https://picsum.photos/seed/tom/50/50', username: 'tomhardy' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle video call initiation
  const handleVideoCall = (contact: Contact) => {
    console.log('Initiating video call with:', contact.name);
    // TODO: Backend integration - initiate video call
    // This will be connected to backend when ready
    alert(`Video call with ${contact.name} - Backend integration ready`);
  };

  // Handle contact click - open conversation
  const handleContactClick = (contact: Contact) => {
    console.log('Opening conversation with:', contact.name);
    // TODO: Backend integration - open conversation
    // This will be connected to backend when ready
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
    { label: 'View Profile', action: () => console.log('View profile') },
    { label: 'Send Message', action: () => console.log('Send message') },
    { label: 'Block Contact', action: () => console.log('Block contact') },
    { label: 'Remove Contact', action: () => console.log('Remove contact') }
  ];

  // Handle menu option click
  const handleMenuOption = (option: string) => {
    console.log('Menu option selected:', option);
    // TODO: Backend integration - handle menu options
    alert(`${option} - Backend integration ready`);
    setShowMenu(false);
  };

  return (
    <aside className="fixed right-0 top-[56px] bottom-0 w-[300px] overflow-y-auto hidden xl:block p-4">
      {/* Sponsored */}
      <section className="mb-6">
        <h3 className="text-gray-500 font-bold text-lg mb-3">Sponsored</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-200 p-3 rounded-xl transition-colors">
            <img src="https://picsum.photos/seed/ad1/150/150" className="w-[120px] h-[120px] object-cover rounded-lg" alt="Ad" />
            <div>
              <p className="font-bold text-base">Solved: Global Warming?</p>
              <p className="text-sm text-gray-500">nexusmind.org</p>
            </div>
          </div>
          <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-200 p-3 rounded-xl transition-colors">
            <img src="https://picsum.photos/seed/ad2/150/150" className="w-[120px] h-[120px] object-cover rounded-lg" alt="Ad" />
            <div>
              <p className="font-bold text-base">New Startup Grant 2024</p>
              <p className="text-sm text-gray-500">grants.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Solutions */}
      <section className="mb-6 pt-4 border-t border-gray-300">
        <h3 className="text-gray-500 font-bold text-lg mb-3">Trending Solutions</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-200 rounded-xl">
            <i className="fa-solid fa-lightbulb text-3xl text-yellow-500"></i>
            <div>
              <p className="text-base font-bold">Climate Change Initiative</p>
              <p className="text-sm text-gray-500">1.2k solvers engaged</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-200 rounded-xl">
            <i className="fa-solid fa-rocket text-3xl text-purple-500"></i>
            <div>
              <p className="text-base font-bold">Tech Startup Accelerator</p>
              <p className="text-sm text-gray-500">856 solvers engaged</p>
            </div>
          </div>
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
    </aside>
  );
};

export default RightSidebar;
