
import React from 'react';

const RightSidebar: React.FC = () => {
  const contacts = [
    { name: 'Sarah Chen', status: 'online', avatar: 'https://picsum.photos/seed/sarah/50/50' },
    { name: 'John Doe', status: 'offline', avatar: 'https://picsum.photos/seed/john/50/50' },
    { name: 'Alex River', status: 'online', avatar: 'https://picsum.photos/seed/alex/50/50' },
    { name: 'Maria Lopez', status: 'online', avatar: 'https://picsum.photos/seed/maria/50/50' },
    { name: 'Tom Hardy', status: 'offline', avatar: 'https://picsum.photos/seed/tom/50/50' }
  ];

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
            <i className="fa-solid fa-video text-xl cursor-pointer hover:text-gray-700"></i>
            <i className="fa-solid fa-magnifying-glass text-xl cursor-pointer hover:text-gray-700"></i>
            <i className="fa-solid fa-ellipsis text-xl cursor-pointer hover:text-gray-700"></i>
          </div>
        </div>
        <div className="space-y-1">
          {contacts.map((contact, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors relative">
              <div className="relative">
                <img src={contact.avatar} className="w-11 h-11 rounded-full" alt={contact.name} />
                {contact.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <span className="text-base font-bold">{contact.name}</span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
};

export default RightSidebar;
