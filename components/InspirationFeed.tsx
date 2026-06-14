import React from 'react';
import { Inspiration, User } from '../types';

interface InspirationFeedProps {
  inspirations: Inspiration[];
  currentUser: User;
  onLike: (inspirationId: string) => void;
}

const InspirationFeed: React.FC<InspirationFeedProps> = ({ inspirations, currentUser, onLike }) => {
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

  if (inspirations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <i className="fa-solid fa-lightbulb text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No inspirations yet</h3>
        <p className="text-gray-500">Be the first to share your inspirational story!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inspirations.map((inspiration) => (
        <div key={inspiration.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <img 
              src={inspiration.userAvatar} 
              className="w-10 h-10 rounded-full object-cover" 
              alt={inspiration.userName} 
            />
            <div className="flex-1">
              <p className="font-semibold text-sm">{inspiration.userName}</p>
              <p className="text-xs text-gray-500">{formatTimestamp(inspiration.timestamp)}</p>
            </div>
            <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-medium">
              Inspire Hub
            </span>
          </div>

          {/* Challenge Badge */}
          <div className="px-4 pt-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full px-4 py-2">
              <i className="fa-solid fa-trophy text-blue-600"></i>
              <span className="text-sm font-medium text-blue-800">{inspiration.challengeOvercome}</span>
            </div>
          </div>

          {/* Image */}
          {inspiration.imageUrl && (
            <div className="mt-4 px-4">
              <img 
                src={inspiration.imageUrl} 
                alt="Inspiration" 
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{inspiration.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 p-4 border-t border-gray-100">
            <button 
              onClick={() => onLike(inspiration.id)}
              className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <i className={`fa-${inspiration.likes > 0 ? 'solid' : 'regular'} fa-heart ${inspiration.likes > 0 ? 'text-pink-600' : ''}`}></i>
              <span className="text-sm font-medium">{inspiration.likes}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-[#1877F2] transition-colors">
              <i className="fa-regular fa-comment"></i>
              <span className="text-sm font-medium">Comment</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-[#1877F2] transition-colors">
              <i className="fa-regular fa-share-from-square"></i>
              <span className="text-sm font-medium">Share</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 transition-colors ml-auto">
              <i className="fa-regular fa-bookmark"></i>
              <span className="text-sm font-medium">Save</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InspirationFeed;
