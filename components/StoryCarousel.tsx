
import React, { useRef, useState, useEffect } from 'react';
import { STORIES } from '../constants';
import { DailyReflection, User } from '../types';
import ReflectionComposer from './ReflectionComposer';
import ReflectionDetail from './ReflectionDetail';

interface StoryCarouselProps {
  user: User;
}

const StoryCarousel: React.FC<StoryCarouselProps> = ({ user }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedReflection, setSelectedReflection] = useState<DailyReflection | null>(null);

  useEffect(() => {
    try {
      const storedReflections = localStorage.getItem('nexus_reflections');
      if (storedReflections) {
        setReflections(JSON.parse(storedReflections));
      }
    } catch (error) {
      console.error('Error loading reflections:', error);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

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
             <span className="text-xs font-semibold">Daily Reflection</span>
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

        {/* Reflections List - Horizontal Display */}
        {reflections.slice(0, 5).map(reflection => (
          <div 
            key={reflection.id} 
            onClick={() => setSelectedReflection(reflection)}
            className="min-w-[112px] h-[190px] rounded-xl overflow-hidden shadow relative cursor-pointer group"
          >
            {reflection.imageUrl ? (
              <img src={reflection.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Reflection" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <i className="fa-solid fa-lightbulb text-white text-3xl"></i>
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            
            {/* Avatar Ring */}
            <div className="absolute top-3 left-3 w-10 h-10 rounded-full border-4 border-purple-500 overflow-hidden">
               <img src={reflection.userAvatar} className="w-full h-full object-cover" alt="Avatar" />
            </div>
            
            <span className="absolute bottom-2 left-3 text-white text-xs font-semibold drop-shadow-md">
              {reflection.userName}
            </span>
            <div className="absolute bottom-2 right-3 flex items-center gap-1 text-white text-xs drop-shadow-md">
              <i className="fa-solid fa-heart text-xs"></i>
              <span>{reflection.likes}</span>
            </div>

            {/* Tags Overlay */}
            {reflection.tags && reflection.tags.length > 0 && (
              <div className="absolute top-3 right-2 flex flex-col gap-1">
                {reflection.tags.slice(0, 2).map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
                {reflection.tags.length > 2 && (
                  <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm">
                    +{reflection.tags.length - 2}
                  </span>
                )}
              </div>
            )}
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

      {/* Reflection Composer Modal */}
      {isComposerOpen && (
        <ReflectionComposer
          user={user}
          onClose={() => setIsComposerOpen(false)}
          onSubmit={handleAddReflection}
        />
      )}

      {/* Reflection Detail Modal */}
      {selectedReflection && (
        <ReflectionDetail
          reflection={selectedReflection}
          currentUser={user}
          onClose={() => setSelectedReflection(null)}
          onLike={handleLike}
        />
      )}
    </div>
  );
};

export default StoryCarousel;
