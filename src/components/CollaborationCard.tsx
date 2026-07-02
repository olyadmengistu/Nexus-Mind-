import React from 'react';
import { Collaboration } from '../types';

interface CollaborationCardProps {
  collaboration: Collaboration;
  onClick: () => void;
}

const CollaborationCard: React.FC<CollaborationCardProps> = ({ collaboration, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return 'fa-rocket';
      case 'partnership': return 'fa-handshake';
      case 'mentorship': return 'fa-graduation-cap';
      case 'investment': return 'fa-chart-line';
      default: return 'fa-lightbulb';
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(collaboration.status)}`}>
          {collaboration.status.charAt(0).toUpperCase() + collaboration.status.slice(1)}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800`}>
          <i className={`fa-solid ${getTypeIcon(collaboration.type)} mr-1`}></i>
          {collaboration.type.charAt(0).toUpperCase() + collaboration.type.slice(1)}
        </span>
      </div>
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{collaboration.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{collaboration.description}</p>
      <div className="flex items-center gap-2 mb-4">
        <img src={collaboration.creatorAvatar} className="w-8 h-8 rounded-full" alt="" />
        <span className="text-sm text-gray-600">{collaboration.creatorName}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {collaboration.requiredSkills.slice(0, 3).map(skill => (
          <span key={skill} className="px-2 py-1 bg-gray-100 rounded text-xs">
            {skill}
          </span>
        ))}
        {collaboration.requiredSkills.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
            +{collaboration.requiredSkills.length - 3} more
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span><i className="fa-solid fa-users mr-1"></i>{collaboration.applicants.length} applicants</span>
        <span><i className="fa-solid fa-clock mr-1"></i>{new Date(collaboration.timestamp).toLocaleDateString()}</span>
      </div>
      {collaboration.budget && (
        <div className="mt-2 text-lg font-bold text-[#1877F2]">
          ${collaboration.budget.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default CollaborationCard;
