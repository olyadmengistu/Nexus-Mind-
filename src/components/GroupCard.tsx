import React from 'react';
import { Group, User } from '../types';

interface GroupCardProps {
  group: Group;
  currentUser: User;
  onJoin: () => void;
  onLeave: () => void;
  onClick: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, currentUser, onJoin, onLeave, onClick }) => {
  const isMember = group.members.some(m => m.id === currentUser.id);

  return (
    <div
      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        <img src={group.coverImage} className="w-full h-full object-cover opacity-50" alt="" />
        <div className="absolute bottom-4 left-4">
          <img src={group.avatar} className="w-16 h-16 rounded-lg border-2 border-white" alt="" />
        </div>
      </div>
      <div className="p-4 pt-8">
        <h3 className="font-semibold mb-1">{group.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span><i className="fa-solid fa-users mr-1"></i>{group.memberCount}</span>
          <span><i className="fa-solid fa-tag mr-1"></i>{group.category}</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          {group.isPrivate && (
            <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">
              <i className="fa-solid fa-lock mr-1"></i>Private
            </span>
          )}
          {isMember && (
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              <i className="fa-solid fa-check mr-1"></i>Joined
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            isMember ? onLeave() : onJoin();
          }}
          className={`w-full px-4 py-2 rounded-lg transition-colors ${
            isMember
              ? 'border border-gray-300 hover:bg-gray-50'
              : 'bg-[#1877F2] text-white hover:bg-[#166FE5]'
          }`}
        >
          <i className={`fa-solid ${isMember ? 'fa-right-from-bracket' : 'fa-user-plus'} mr-2`}></i>
          {isMember ? 'Leave Group' : 'Join Group'}
        </button>
      </div>
    </div>
  );
};

export default GroupCard;
