import React, { useState } from 'react';
import { DailyReflection, User } from '../types';

interface ReflectionDetailProps {
  reflection: DailyReflection;
  currentUser: User;
  onClose: () => void;
  onLike: (reflectionId: string) => void;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
}

const ReflectionDetail: React.FC<ReflectionDetailProps> = ({ reflection, currentUser, onClose, onLike }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);

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

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: newComment.trim(),
      timestamp: Date.now(),
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(reflection.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Daily Reflection',
        text: reflection.content,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(reflection.content);
      alert('Reflection copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src={reflection.userAvatar} className="w-10 h-10 rounded-full object-cover" alt="User" />
            <div>
              <p className="font-semibold text-sm">{reflection.userName}</p>
              <p className="text-xs text-gray-500">{formatTimestamp(reflection.timestamp)}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full"
          >
            <i className="fa-solid fa-xmark text-gray-600"></i>
          </button>
        </div>

        {/* Tags */}
        {reflection.tags && reflection.tags.length > 0 && (
          <div className="px-4 py-2 flex flex-wrap gap-2">
            {reflection.tags.map((tag, index) => (
              <span 
                key={index}
                className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Image */}
        {reflection.imageUrl && (
          <div className="w-full">
            <img 
              src={reflection.imageUrl} 
              alt="Reflection" 
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-800 whitespace-pre-wrap">{reflection.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-200">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          >
            <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
            <span className="text-sm font-medium">{reflection.likes + (isLiked ? 1 : 0)}</span>
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-[#1877F2] transition-colors">
            <i className="fa-regular fa-comment"></i>
            <span className="text-sm font-medium">{comments.length}</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-600 hover:text-[#1877F2] transition-colors"
          >
            <i className="fa-regular fa-share-from-square"></i>
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-200">
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-3">Comments</h3>
            
            {/* Add Comment */}
            <div className="flex items-start gap-3 mb-4">
              <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover" alt="User" />
              <div className="flex-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1877F2] text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="mt-2 px-4 py-1.5 bg-[#1877F2] text-white text-sm rounded-lg hover:bg-[#166FE5] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Post
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <img src={comment.userAvatar} className="w-8 h-8 rounded-full object-cover" alt="User" />
                    <div className="flex-1 bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm">{comment.userName}</p>
                        <p className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</p>
                      </div>
                      <p className="text-sm text-gray-800">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReflectionDetail;
