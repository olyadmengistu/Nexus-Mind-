
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post, User, Solution } from '../types';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onVote: (postId: string, delta: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onVote }) => {
  const navigate = useNavigate();
  const [showSolutions, setShowSolutions] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [newSolution, setNewSolution] = useState('');

  const handleVoteClick = () => {
    onVote(post.id, hasVoted ? -1 : 1);
    setHasVoted(!hasVoted);
  };

  const handleAddSolution = () => {
    if (!newSolution.trim()) return;
    
    const solution: Solution = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: newSolution,
      timestamp: Date.now(),
      upvotes: 0
    };

    post.solutions.push(solution);
    // In a real app we'd trigger a parent update
    setNewSolution('');
  };

  const formatDate = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
             <img src={post.userAvatar} className="w-10 h-10 rounded-full object-cover" alt={post.userName} />
             {post.isSolved && (
               <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 rounded-full border-2 border-white text-[8px]">
                 <i className="fa-solid fa-check"></i>
               </div>
             )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h4 className="font-semibold text-[15px] leading-tight cursor-pointer hover:underline">{post.userName}</h4>
              <span className="text-gray-500 text-xs">•</span>
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{post.category}</span>
            </div>
            <p className="text-gray-500 text-[13px]">{formatDate(post.timestamp)} · <i className="fa-solid fa-earth-americas"></i></p>
          </div>
        </div>
        <button className="text-gray-500 hover:bg-gray-100 w-8 h-8 rounded-full transition-colors">
          <i className="fa-solid fa-ellipsis"></i>
        </button>
      </div>

      {/* Content */}
      <div className="px-3 pb-2 space-y-2">
        {post.title && <h3 className="font-bold text-[17px]">{post.title}</h3>}
        <p className="text-[15px] whitespace-pre-wrap">{post.content}</p>
        
        {/* Emoji Display */}
        {post.emoji && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-xl">{post.emoji}</span>
            <span>feeling</span>
          </div>
        )}

        {/* Location Display */}
        {post.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <i className="fa-solid fa-location-dot text-[#F3425E]"></i>
            <span>{post.location}</span>
          </div>
        )}

        {/* Tagged Users Display */}
        {post.taggedUsers && post.taggedUsers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.taggedUsers.map((tag, index) => (
              <span key={index} className="text-sm text-blue-600 hover:underline cursor-pointer">
                @{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="w-full h-auto border-y border-gray-100">
          <img src={post.imageUrl} className="w-full object-cover max-h-[500px]" alt="Post Content" />
        </div>
      )}

      {/* Stats */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-1.5 cursor-pointer hover:underline group">
          <div className="flex -space-x-1">
             <div className="bg-blue-500 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white">
               <i className="fa-solid fa-thumbs-up"></i>
             </div>
             <div className="bg-yellow-500 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white">
               <i className="fa-solid fa-lightbulb"></i>
             </div>
          </div>
          <span className="text-gray-500 text-[14px]">{post.votes} helpful votes</span>
        </div>
        <div className="flex gap-3 text-[14px] text-gray-500">
           <span className="hover:underline cursor-pointer">{post.solutions.length} solutions</span>
           <span className="hover:underline cursor-pointer">12 shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 py-1 flex items-center justify-around">
        <button 
          onClick={handleVoteClick}
          className={`flex items-center gap-2 hover:bg-gray-100 flex-1 justify-center py-2 rounded-lg font-semibold text-sm transition-colors ${hasVoted ? 'text-blue-500' : 'text-[#65676B]'}`}
        >
          <i className={`fa-regular fa-thumbs-up ${hasVoted ? 'fa-solid' : ''}`}></i> Helpful
        </button>
        <button 
          onClick={() => navigate(`/solutions/${post.id}`)}
          className="flex items-center gap-2 hover:bg-gray-100 flex-1 justify-center py-2 rounded-lg text-[#65676B] font-semibold text-sm transition-colors"
        >
          <i className="fa-regular fa-comment"></i> Suggest Solution
        </button>
        <button className="flex items-center gap-2 hover:bg-gray-100 flex-1 justify-center py-2 rounded-lg text-[#65676B] font-semibold text-sm transition-colors">
          <i className="fa-solid fa-share"></i> Share
        </button>
      </div>

      {/* Solutions Section */}
      {showSolutions && (
        <div className="px-3 py-3 bg-gray-50 space-y-3 rounded-b-lg">
          {post.solutions.map(sol => (
            <div key={sol.id} className="flex gap-2">
              <img src={sol.userAvatar} className="w-8 h-8 rounded-full" alt={sol.userName} />
              <div className="bg-gray-200 p-2 rounded-2xl max-w-[90%]">
                <p className="font-bold text-xs">{sol.userName}</p>
                <p className="text-[14px]">{sol.text}</p>
                <div className="flex items-center gap-3 mt-1 text-[12px] font-bold text-gray-500">
                   <span className="hover:underline cursor-pointer">Helpful</span>
                   <span className="hover:underline cursor-pointer">Reply</span>
                   <span>{formatDate(sol.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* New Solution Input */}
          <div className="flex gap-2 items-center">
            <img src={currentUser.avatar} className="w-8 h-8 rounded-full" alt="Me" />
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={newSolution}
                onChange={(e) => setNewSolution(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSolution()}
                placeholder="Suggest a solution..."
                className="w-full bg-[#F0F2F5] px-3 py-2 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 text-gray-500 text-xs">
                <i className="fa-regular fa-face-smile cursor-pointer"></i>
                <i className="fa-solid fa-camera cursor-pointer"></i>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
