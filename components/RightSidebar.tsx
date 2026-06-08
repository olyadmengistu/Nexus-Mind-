
import React, { useState } from 'react';

interface Contact {
  id: string;
  name: string;
  status: 'online' | 'offline';
  avatar: string;
  lastSeen?: string;
}

const RightSidebar: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Sarah Chen', status: 'online', avatar: 'https://picsum.photos/seed/sarah/50/50' },
    { id: '2', name: 'John Doe', status: 'offline', avatar: 'https://picsum.photos/seed/john/50/50', lastSeen: '2 hours ago' },
    { id: '3', name: 'Alex River', status: 'online', avatar: 'https://picsum.photos/seed/alex/50/50' },
    { id: '4', name: 'Maria Lopez', status: 'online', avatar: 'https://picsum.photos/seed/maria/50/50' },
    { id: '5', name: 'Tom Hardy', status: 'offline', avatar: 'https://picsum.photos/seed/tom/50/50', lastSeen: '1 day ago' }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler for search icon click
  const handleSearchClick = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery('');
    }
  };

  // Handler for video call icon click
  const handleVideoCallClick = () => {
    // This will be connected to backend video call feature
    console.log('Video call feature - ready for backend integration');
    setShowVideoCall(true);
  };

  // Handler for ellipsis menu click
  const handleMenuClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.left, y: rect.bottom + 5 });
    setShowContactMenu(!showContactMenu);
  };

  // Handler for contact item click
  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    // This will be connected to backend chat/profile feature
    console.log('Contact clicked:', contact.name, '- ready for backend integration');
  };

  // Handler for starting video call with specific contact
  const handleStartVideoCall = (contact: Contact) => {
    setSelectedContact(contact);
    setShowVideoCall(true);
    console.log('Starting video call with:', contact.name, '- ready for backend integration');
  };

  // Handler for adding new contact
  const handleAddContact = () => {
    console.log('Add contact feature - ready for backend integration');
    setShowContactMenu(false);
  };

  // Handler for contact settings
  const handleContactSettings = () => {
    console.log('Contact settings feature - ready for backend integration');
    setShowContactMenu(false);
  };

  // Handler for viewing all contacts
  const handleViewAllContacts = () => {
    console.log('View all contacts feature - ready for backend integration');
    setShowContactMenu(false);
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
              onClick={handleVideoCallClick}
              title="Start video call"
            ></i>
            <i 
              className="fa-solid fa-magnifying-glass text-xl cursor-pointer hover:text-gray-700" 
              onClick={handleSearchClick}
              title="Search contacts"
            ></i>
            <i 
              className="fa-solid fa-ellipsis text-xl cursor-pointer hover:text-gray-700" 
              onClick={handleMenuClick}
              title="Contact options"
            ></i>
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
              autoFocus
            />
          </div>
        )}
        
        {/* Contact Menu Dropdown */}
        {showContactMenu && (
          <div 
            className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 w-48"
            style={{ left: menuPosition.x - 150, top: menuPosition.y }}
          >
            <button
              onClick={handleAddContact}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
            >
              <i className="fa-solid fa-user-plus text-gray-600"></i>
              <span>Add Contact</span>
            </button>
            <button
              onClick={handleViewAllContacts}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
            >
              <i className="fa-solid fa-users text-gray-600"></i>
              <span>View All Contacts</span>
            </button>
            <button
              onClick={handleContactSettings}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
            >
              <i className="fa-solid fa-cog text-gray-600"></i>
              <span>Contact Settings</span>
            </button>
          </div>
        )}
        
        <div className="space-y-1">
          {filteredContacts.map((contact) => (
            <div 
              key={contact.id} 
              className="flex items-center gap-4 p-3 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors relative group"
              onClick={() => handleContactClick(contact)}
            >
              <div className="relative">
                <img src={contact.avatar} className="w-11 h-11 rounded-full" alt={contact.name} />
                {contact.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <span className="text-base font-bold block">{contact.name}</span>
                {contact.status === 'offline' && contact.lastSeen && (
                  <span className="text-xs text-gray-500">{contact.lastSeen}</span>
                )}
              </div>
              {/* Video call button on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartVideoCall(contact);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-blue-500"
                title="Video call"
              >
                <i className="fa-solid fa-video"></i>
              </button>
            </div>
          ))}
        </div>
      </section>
      
      {/* Video Call Modal */}
      {showVideoCall && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Video Call</h3>
              <button 
                onClick={() => setShowVideoCall(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <img 
                src={selectedContact.avatar} 
                className="w-24 h-24 rounded-full mb-4" 
                alt={selectedContact.name} 
              />
              <p className="text-lg font-bold mb-2">{selectedContact.name}</p>
              <p className="text-gray-500 mb-6">
                {selectedContact.status === 'online' ? 'Online' : 'Offline'}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    console.log('Starting video call with', selectedContact.name, '- ready for backend integration');
                    setShowVideoCall(false);
                  }}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 flex items-center gap-2"
                >
                  <i className="fa-solid fa-video"></i>
                  Start Call
                </button>
                <button 
                  onClick={() => setShowVideoCall(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
                >
                  Cancel
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
