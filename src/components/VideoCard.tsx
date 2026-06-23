import React from 'react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <div
      className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-video bg-gray-200 relative">
        <img src={video.thumbnail} className="w-full h-full object-cover" alt={video.title} />
        <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
          {video.duration}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
        <div className="flex items-center gap-2 mb-2">
          <img src={video.userAvatar} className="w-6 h-6 rounded-full" alt="" />
          <span className="text-sm text-gray-600">{video.userName}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span><i className="fa-solid fa-eye mr-1"></i>{video.views}</span>
          <span><i className="fa-solid fa-heart mr-1"></i>{video.likes}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
