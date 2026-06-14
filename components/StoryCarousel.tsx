
import React, { useRef, useState, useEffect } from 'react';
import { STORIES } from '../constants';
import { Inspiration, User } from '../types';
import InspirationComposer from './InspirationComposer';
import InspirationStoryViewer from './InspirationStoryViewer';

interface StoryCarouselProps {
  user: User;
}

const StoryCarousel: React.FC<StoryCarouselProps> = ({ user }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedInspirationIndex, setSelectedInspirationIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const storedInspirations = localStorage.getItem('nexus_inspirations');
      if (storedInspirations) {
        setInspirations(JSON.parse(storedInspirations));
      }
    } catch (error) {
      console.error('Error loading inspirations:', error);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

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
    <div className="relative group">
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto no-scrollbar py-2"
      >
        {/* Create Reflection */}
        <div 
          onClick={() => setIsComposerOpen(true)}
          className="min-w-[112px] h-[190px] rounded-xl overflow-hidden shadow bg-white flex flex-col cursor-pointer hover:bg-gray-50 group"
        >
           <div className="flex-1 overflow-hidden">
             <img src="https://picsum.photos/seed/me/200/300" className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Create" />
           </div>
           <div className="h-[48px] relative flex items-end justify-center pb-2">
             <div className="absolute -top-4 w-8 h-8 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center text-white">
               <i className="fa-solid fa-plus"></i>
             </div>
             <span className="text-xs font-semibold">Inspire Hub</span>
           </div>
        </div>

        {/* Stories List */}
        {STORIES.map(story => (
          <div key={story.id} className="min-w-[112px] h-[190px] rounded-xl overflow-hidden shadow relative cursor-pointer group">
             <img src={story.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={story.userName} />
             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
             
             {/* Avatar Ring */}
             <div className="absolute top-3 left-3 w-10 h-10 rounded-full border-4 border-[#1877F2] overflow-hidden">
                <img src={story.userAvatar} className="w-full h-full object-cover" alt="Avatar" />
             </div>
             
             <span className="absolute bottom-2 left-3 text-white text-xs font-semibold drop-shadow-md">
               {story.userName}
             </span>
          </div>
        ))}

        {/* Inspirations List - Horizontal Display */}
        {inspirations.slice(0, 5).map((inspiration, index) => (
          <div 
            key={inspiration.id} 
            onClick={() => setSelectedInspirationIndex(index)}
            className="min-w-[112px] h-[190px] rounded-xl overflow-hidden shadow relative cursor-pointer group"
          >
            {inspiration.imageUrl ? (
              <img src={inspiration.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Inspiration" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <i className="fa-solid fa-lightbulb text-white text-3xl"></i>
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            
            {/* Avatar Ring */}
            <div className="absolute top-3 left-3 w-10 h-10 rounded-full border-4 border-purple-500 overflow-hidden">
               <img src={inspiration.userAvatar} className="w-full h-full object-cover" alt="Avatar" />
            </div>
            
            <span className="absolute bottom-2 left-3 text-white text-xs font-semibold drop-shadow-md">
              {inspiration.userName}
            </span>
            <div className="absolute bottom-2 right-3 flex items-center gap-1 text-white text-xs drop-shadow-md">
              <i className="fa-solid fa-heart text-xs"></i>
              <span>{inspiration.likes}</span>
            </div>

            {/* Challenge Badge */}
            <div className="absolute top-3 right-2">
              <span className="bg-white/90 backdrop-blur-sm text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm">
                {inspiration.challengeOvercome}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Nav Buttons */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button 
        onClick={() => scroll('right')}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>

      {/* Inspiration Composer Modal */}
      {isComposerOpen && (
        <InspirationComposer
          user={user}
          onClose={() => setIsComposerOpen(false)}
          onSubmit={handleAddInspiration}
        />
      )}

      {/* Inspiration Story Viewer */}
      {selectedInspirationIndex !== null && (
        <InspirationStoryViewer
          inspirations={inspirations}
          initialIndex={selectedInspirationIndex}
          currentUser={user}
          onClose={() => setSelectedInspirationIndex(null)}
          onLike={handleLike}
        />
      )}
    </div>
  );
};

export default StoryCarousel;
