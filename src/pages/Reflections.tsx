import React, { useState, useEffect } from 'react';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import InspirationFeed from '../components/InspirationFeed';
import InspirationComposer from '../components/InspirationComposer';
import { User, Inspiration } from '../types';
import { inspirationsApi } from '../lib/firebaseApi';

interface ReflectionsProps {
  user: User;
}

const Reflections: React.FC<ReflectionsProps> = ({ user }) => {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    // Load inspirations from Firestore
    const loadInspirations = async () => {
      try {
        const data = await inspirationsApi.getAllInspirations();
        setInspirations(data as Inspiration[]);
      } catch (error) {
        console.error('Error loading inspirations from Firestore:', error);
        // Fallback to empty array
        setInspirations([]);
      }
    };
    loadInspirations();
  }, []);

  const handleAddInspiration = async (newInspiration: Inspiration) => {
    try {
      const { id: _localId, ...inspirationData } = newInspiration;
      const created = await inspirationsApi.createInspiration(inspirationData);
      const updatedInspirations = [created as Inspiration, ...inspirations];
      setInspirations(updatedInspirations);
    } catch (error) {
      console.error('Error saving inspiration to Firestore:', error);
    }
  };

  const handleLike = async (inspirationId: string) => {
    try {
      await inspirationsApi.likeInspiration(inspirationId, 1);
      const updatedInspirations = inspirations.map(inspiration =>
        inspiration.id === inspirationId
          ? { ...inspiration, likes: inspiration.likes + 1 }
          : inspiration
      );
      setInspirations(updatedInspirations);
    } catch (error) {
      console.error('Error liking inspiration:', error);
    }
  };

  return (
    <div className="flex justify-center min-h-screen">
      <LeftSidebar user={user} />

      <div className="w-full max-w-[680px] px-0 py-2 space-y-3 sm:px-4 sm:py-4 sm:space-y-4 lg:ml-[280px] xl:mr-[300px]">
        {/* Header */}
        <div className="bg-white sm:rounded-lg shadow-sm p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Inspire Hub</h1>
              <p className="text-gray-500 text-sm mt-1">Share your journey and inspire the NexusMind community</p>
            </div>
            <button
              onClick={() => setIsComposerOpen(true)}
              className="flex w-full items-center justify-center gap-2 bg-[#1877F2] text-white px-4 py-2 rounded-lg hover:bg-[#166FE5] transition-colors sm:w-auto"
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
