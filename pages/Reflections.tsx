import React, { useState, useEffect } from 'react';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import ReflectionFeed from '../components/ReflectionFeed';
import ReflectionComposer from '../components/ReflectionComposer';
import { User, DailyReflection } from '../types';

interface ReflectionsProps {
  user: User;
}

const Reflections: React.FC<ReflectionsProps> = ({ user }) => {
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    // Load reflections from localStorage
    try {
      const storedReflections = localStorage.getItem('nexus_reflections');
      if (storedReflections) {
        setReflections(JSON.parse(storedReflections));
      } else {
        // Add some sample reflections
        const sampleReflections: DailyReflection[] = [
          {
            id: '1',
            userId: 'sample1',
            userName: 'Sarah Chen',
            userAvatar: 'https://i.pravatar.cc/150?img=1',
            content: 'Today I realized that taking small breaks throughout the day actually boosts my productivity. I used to think I needed to power through, but stepping away for 5 minutes every hour has made a huge difference.',
            imageUrl: 'https://picsum.photos/seed/reflection1/600/400',
            tags: ['Thoughtful', 'Focused'],
            timestamp: Date.now() - 3600000,
            likes: 12,
          },
          {
            id: '2',
            userId: 'sample2',
            userName: 'John Doe',
            userAvatar: 'https://i.pravatar.cc/150?img=2',
            content: 'Grateful for the conversations I had today. Sometimes the best insights come from unexpected places. Listening more and speaking less has been my goal this week.',
            imageUrl: undefined,
            tags: ['Grateful', 'Peaceful'],
            timestamp: Date.now() - 7200000,
            likes: 8,
          },
        ];
        setReflections(sampleReflections);
        localStorage.setItem('nexus_reflections', JSON.stringify(sampleReflections));
      }
    } catch (error) {
      console.error('Error loading reflections:', error);
    }
  }, []);

  const handleAddReflection = (newReflection: DailyReflection) => {
    const updatedReflections = [newReflection, ...reflections];
    setReflections(updatedReflections);
    localStorage.setItem('nexus_reflections', JSON.stringify(updatedReflections));
  };

  const handleLike = (reflectionId: string) => {
    const updatedReflections = reflections.map(reflection =>
      reflection.id === reflectionId
        ? { ...reflection, likes: reflection.likes + 1 }
        : reflection
    );
    setReflections(updatedReflections);
    localStorage.setItem('nexus_reflections', JSON.stringify(updatedReflections));
  };

  return (
    <div className="flex justify-center min-h-screen">
      <LeftSidebar user={user} />

      <div className="w-full max-w-[680px] px-4 py-4 space-y-4 lg:ml-[280px] lg:mr-[300px]">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Daily Reflections</h1>
              <p className="text-gray-500 text-sm mt-1">Share your personal insights and connect with others</p>
            </div>
            <button
              onClick={() => setIsComposerOpen(true)}
              className="flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2 rounded-lg hover:bg-[#166FE5] transition-colors"
            >
              <i className="fa-solid fa-plus"></i>
              <span className="font-medium">New Reflection</span>
            </button>
          </div>
        </div>

        {/* Reflections Feed */}
        <ReflectionFeed reflections={reflections} currentUser={user} onLike={handleLike} />
      </div>

      <RightSidebar />

      {/* Composer Modal */}
      {isComposerOpen && (
        <ReflectionComposer
          user={user}
          onClose={() => setIsComposerOpen(false)}
          onSubmit={handleAddReflection}
        />
      )}
    </div>
  );
};

export default Reflections;
