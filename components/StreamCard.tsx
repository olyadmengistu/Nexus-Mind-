import React from 'react';
import { LiveStream } from '../types';

interface StreamCardProps {
  stream: LiveStream;
  onClick: () => void;
  isOwner?: boolean;
  onStartStream?: (streamId: string) => void;
  onDeleteStream?: (streamId: string) => void;
}

const StreamCard: React.FC<StreamCardProps> = ({ 
  stream, 
  onClick, 
  isOwner = false,
  onStartStream,
  onDeleteStream 
}) => {
  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStartStream) {
      onStartStream(stream.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteStream) {
      onDeleteStream(stream.id);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-video bg-gray-200 relative">
        <img src={stream.thumbnail} className="w-full h-full object-cover" alt={stream.title} />
        <div className="absolute top-2 left-2 flex gap-2">
          {stream.status === 'live' && (
            <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              LIVE
            </div>
          )}
          {stream.status === 'scheduled' && (
            <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
              SCHEDULED
            </div>
          )}
          {stream.isRecording && (
            <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
              REC
            </div>
          )}
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          <i className="fa-solid fa-eye mr-1"></i>{stream.viewers}
        </div>
        {stream.isPrivate && (
          <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            <i className="fa-solid fa-lock"></i>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{stream.title}</h3>
        <div className="flex items-center gap-2 mb-2">
          <img src={stream.streamerAvatar} className="w-6 h-6 rounded-full" alt="" />
          <span className="text-sm text-gray-600">{stream.streamerName}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
          <span><i className="fa-solid fa-heart mr-1"></i>{stream.likes}</span>
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">{stream.category}</span>
        </div>
        {stream.status === 'scheduled' && stream.scheduledTime && (
          <p className="text-sm text-gray-500">
            <i className="fa-solid fa-calendar mr-1"></i>
            {new Date(stream.scheduledTime).toLocaleString()}
          </p>
        )}
        {isOwner && stream.status === 'scheduled' && (
          <button
            onClick={handleStartClick}
            className="mt-2 w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
          >
            Start Now
          </button>
        )}
        {isOwner && (
          <button
            onClick={handleDeleteClick}
            className="mt-2 w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default StreamCard;
