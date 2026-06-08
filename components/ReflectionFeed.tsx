import React from 'react';
import { DailyReflection, User } from '../types';

interface ReflectionFeedProps {
  reflections: DailyReflection[];
  currentUser: User;
  onLike: (reflectionId: string) => void;
}

const ReflectionFeed: React.FC<ReflectionFeedProps> = ({ reflections, currentUser, onLike }) => {
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (reflections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <i className="fa-solid fa-lightbulb text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No reflections yet</h3>
        <p className="text-gray-500">Be the first to share your daily reflection!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reflections.map((reflection) => (
        <div key={reflection.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <img 
              src={reflection.userAvatar} 
              className="w-10 h-10 rounded-full object-cover" 
              alt={reflection.userName} 
            />
            <div className="flex-1">
              <p className="font-semibold text-sm">{reflection.userName}</p>
              <p className="text-xs text-gray-500">{formatTimestamp(reflection.timestamp)}</p>
            </div>
            <span className="text-xs bg-[#E7F3FF] text-[#1877F2] px-2 py-1 rounded-full font-medium">
              Daily Reflection
            </span>
          </div>

          {/* Content and Image */}
          <div className="p-4">
            {reflection.imageUrl ? (
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-gray-800 whitespace-pre-wrap">{reflection.content}</p>
                </div>
                <div className="flex-shrink-0">
                  <img 
                    src={reflection.imageUrl} 
                    alt="Reflection image" 
                    className="w-48 h-48 object-cover rounded-lg"
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-800 whitespace-pre-wrap">{reflection.content}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 p-4 border-t border-gray-100">
            <button 
              onClick={() => onLike(reflection.id)}
              className="flex items-center gap-2 text-gray-600 hover:text-[#1877F2] transition-colors"
            >
              <i className={`fa-${reflection.likes > 0 ? 'solid' : 'regular'} fa-heart`}></i>
              <span className="text-sm font-medium">{reflection.likes}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-[#1877F2] transition-colors">
              <i className="fa-regular fa-comment"></i>
              <span className="text-sm font-medium">Comment</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-[#1877F2] transition-colors">
              <i className="fa-regular fa-share-from-square"></i>
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReflectionFeed;
