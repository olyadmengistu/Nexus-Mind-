import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getRecommendedCreators, getInterestNames } from '../lib/recommendations';
import { INTERESTS } from '../constants/interests';
import { userApi as firebaseUserApi } from '../lib/firebaseApi';

interface SuggestedCreatorsProps {
  currentUser: User;
  allUsers: User[];
  onFollow?: (userId: string) => void;
}

const SuggestedCreators: React.FC<SuggestedCreatorsProps> = ({ 
  currentUser, 
  allUsers, 
  onFollow 
}) => {
  const [suggestedCreators, setSuggestedCreators] = useState<User[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Get user interests
    const userInterests = currentUser.interests || JSON.parse(localStorage.getItem('nexus_user_interests') || '[]');
    
    // Get recommended creators
    const creators = getRecommendedCreators(allUsers, userInterests, currentUser.id);
    setSuggestedCreators(creators);

    // Load existing following list
    const followingList = JSON.parse(localStorage.getItem('nexus_following') || '[]');
    setFollowing(new Set(followingList));
  }, [currentUser, allUsers]);

  const handleFollow = async (creatorId: string) => {
    setFollowing(prev => new Set(prev).add(creatorId));
    
    // Save to localStorage
    const followingList = JSON.parse(localStorage.getItem('nexus_following') || '[]');
    if (!followingList.includes(creatorId)) {
      followingList.push(creatorId);
      localStorage.setItem('nexus_following', JSON.stringify(followingList));
    }

    // Sync with Firebase
    try {
      await firebaseUserApi.followUser(currentUser.id, creatorId);
    } catch (error) {
      console.warn('Firebase follow failed, using local storage:', error);
    }

    if (onFollow) {
      onFollow(creatorId);
    }
  };

  const handleDismiss = (creatorId: string) => {
    setDismissed(prev => new Set(prev).add(creatorId));
  };

  const getSharedInterests = (creator: User): string[] => {
    const userInterests = currentUser.interests || JSON.parse(localStorage.getItem('nexus_user_interests') || '[]');
    const creatorInterests = creator.interests || [];
    return creatorInterests.filter(interest => userInterests.includes(interest));
  };

  const getExpertiseLabel = (interestId: string): string => {
    const interest = INTERESTS.find(i => i.id === interestId);
    return interest ? interest.name : interestId;
  };

  const visibleCreators = suggestedCreators.filter(creator => !dismissed.has(creator.id));

  if (visibleCreators.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-800 font-bold text-lg">Suggested Creators</h3>
        <span className="text-xs text-gray-500">Based on your interests</span>
      </div>

      <div className="space-y-3">
        {visibleCreators.slice(0, 5).map((creator) => {
          const sharedInterests = getSharedInterests(creator);
          const isFollowing = following.has(creator.id);

          return (
            <div
              key={creator.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800 truncate">{creator.name}</h4>
                  {creator.reputation > 100 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">
                      Expert
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">@{creator.username}</p>
                
                {/* Shared Interests */}
                {sharedInterests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sharedInterests.slice(0, 2).map((interestId) => (
                      <span
                        key={interestId}
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                      >
                        {getExpertiseLabel(interestId)}
                      </span>
                    ))}
                    {sharedInterests.length > 2 && (
                      <span className="text-xs text-gray-500">+{sharedInterests.length - 2} more</span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700">{creator.reputation || 0}</span>
                    <span>reputation</span>
                  </span>
                  {creator.badges && creator.badges.length > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="font-semibold text-gray-700">{creator.badges.length}</span>
                      <span>badges</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {!isFollowing ? (
                  <button
                    onClick={() => handleFollow(creator.id)}
                    className="bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Follow
                  </button>
                ) : (
                  <button
                    className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm"
                  >
                    Following
                  </button>
                )}
                <button
                  onClick={() => handleDismiss(creator.id)}
                  className="text-gray-400 hover:text-gray-600 text-xs transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* View More Link */}
      {visibleCreators.length > 5 && (
        <button className="w-full text-center text-[#1877F2] font-semibold text-sm mt-4 hover:underline">
          View More Creators
        </button>
      )}
    </div>
  );
};

export default SuggestedCreators;
