import React, { useState, useEffect } from 'react';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import InspirationFeed from '../components/InspirationFeed';
import InspirationComposer from '../components/InspirationComposer';
import { User, Inspiration } from '../types';

interface ReflectionsProps {
  user: User;
}

const Reflections: React.FC<ReflectionsProps> = ({ user }) => {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    // Load inspirations from localStorage
    try {
      const storedInspirations = localStorage.getItem('nexus_inspirations');
      if (storedInspirations) {
        setInspirations(JSON.parse(storedInspirations));
      } else {
        // Add some sample inspirations
        const sampleInspirations: Inspiration[] = [
          {
            id: '1',
            userId: 'sample1',
            userName: 'Sarah Chen',
            userAvatar: 'https://i.pravatar.cc/150?img=1',
            content: 'After struggling with imposter syndrome for years, I finally realized that my unique perspective is my greatest strength. I stopped comparing myself to others and started embracing my own journey.',
            imageUrl: 'https://picsum.photos/seed/inspire1/600/400',
            challengeOvercome: 'Overcoming imposter syndrome',
            timestamp: Date.now() - 3600000,
            likes: 24,
          },
          {
            id: '2',
            userId: 'sample2',
            userName: 'Marcus Johnson',
            userAvatar: 'https://i.pravatar.cc/150?img=2',
            content: 'I lost my job during the pandemic and thought my career was over. Instead of giving up, I learned to code and built a startup that now helps thousands of people. Your lowest point can be your foundation for greatness.',
            imageUrl: 'https://picsum.photos/seed/inspire2/600/400',
            challengeOvercome: 'Career transition after job loss',
            timestamp: Date.now() - 7200000,
            likes: 45,
          },
        ];
        setInspirations(sampleInspirations);
        localStorage.setItem('nexus_inspirations', JSON.stringify(sampleInspirations));
      }
    } catch (error) {
      console.error('Error loading inspirations:', error);
    }
  }, []);

  const handleAddInspiration = (newInspiration: Inspiration) => {
    const updatedInspirations = [newInspiration, ...inspirations];
    setInspirations(updatedInspirations);
    localStorage.setItem('nexus_inspirations', JSON.stringify(updatedInspirations));
  };

  const handleLike = (inspirationId: string) => {
    const updatedInspirations = inspirations.map(inspiration =>
      inspiration.id === inspirationId
        ? { ...inspiration, likes: inspiration.likes + 1 }
        : inspiration
    );
    setInspirations(updatedInspirations);
    localStorage.setItem('nexus_inspirations', JSON.stringify(updatedInspirations));
  };

  return (
    <div className="flex justify-center min-h-screen">
      <LeftSidebar user={user} />

      <div className="w-full max-w-[680px] px-4 py-4 space-y-4 lg:ml-[280px] lg:mr-[300px]">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Inspire Hub</h1>
              <p className="text-gray-500 text-sm mt-1">Share your journey and inspire the NexusMind community</p>
            </div>
            <button
              onClick={() => setIsComposerOpen(true)}
              className="flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2 rounded-lg hover:bg-[#166FE5] transition-colors"
            >
              <i className="fa-solid fa-camera"></i>
              <span className="font-medium">Share Inspiration</span>
            </button>
          </div>
        </div>

        {/* Inspirations Feed */}
        <InspirationFeed inspirations={inspirations} currentUser={user} onLike={handleLike} />
      </div>

      <RightSidebar />

      {/* Composer Modal */}
      {isComposerOpen && (
        <InspirationComposer
          user={user}
          onClose={() => setIsComposerOpen(false)}
          onSubmit={handleAddInspiration}
        />
      )}
    </div>
  );
};

export default Reflections;
