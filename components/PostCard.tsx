
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
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleVoteClick = () => {
    onVote(post.id, hasVoted ? -1 : 1);
    setHasVoted(!hasVoted);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    const shareData = {
      title: post.title || 'Post from NexusMind',
      text: post.content?.substring(0, 100) || 'Check out this post',
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
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
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
             <img src={post.userAvatar} className="w-12 h-12 rounded-full object-cover" alt={post.userName} />
             {post.isSolved && (
               <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white text-xs">
                 <i className="fa-solid fa-check"></i>
               </div>
             )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base leading-tight cursor-pointer hover:underline">{post.userName}</h4>
              <span className="text-gray-500 text-sm">•</span>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{post.category}</span>
            </div>
            <p className="text-gray-500 text-sm">{formatDate(post.timestamp)} · <i className="fa-solid fa-earth-americas"></i></p>
          </div>
        </div>
        <button className="text-gray-500 hover:bg-gray-100 w-10 h-10 rounded-full transition-colors">
          <i className="fa-solid fa-ellipsis text-lg"></i>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 space-y-3">
        {post.title && <h3 className="font-bold text-lg">{post.title}</h3>}
        <p className="text-base whitespace-pre-wrap">{post.content}</p>
        
        {/* Emoji Display */}
        {post.emoji && (
          <div className="flex items-center gap-3 text-base text-gray-600">
            <span className="text-2xl">{post.emoji}</span>
            <span className="font-medium">feeling</span>
          </div>
        )}

        {/* Location Display */}
        {post.location && (
          <div className="flex items-center gap-3 text-base text-gray-600">
            <i className="fa-solid fa-location-dot text-[#F3425E] text-xl"></i>
            <span className="font-medium">{post.location}</span>
          </div>
        )}

        {/* Tagged Users Display */}
        {post.taggedUsers && post.taggedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.taggedUsers.map((tag, index) => (
              <span key={index} className="text-base text-blue-600 hover:underline cursor-pointer font-medium">
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
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2 cursor-pointer hover:underline group">
          <div className="flex -space-x-1">
             <div className="bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white">
               <i className="fa-solid fa-thumbs-up"></i>
             </div>
             <div className="bg-yellow-500 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white">
               <i className="fa-solid fa-lightbulb"></i>
             </div>
          </div>
          <span className="text-gray-500 text-base font-medium">{post.votes} helpful votes</span>
        </div>
        <div className="flex gap-4 text-base text-gray-500 font-medium">
           <span className="hover:underline cursor-pointer">{post.solutions.length} solutions</span>
           <span className="hover:underline cursor-pointer">12 shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 flex items-center justify-around">
        <button
          onClick={handleVoteClick}
          className={`flex items-center gap-2 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 flex-1 justify-center py-3 rounded-full font-semibold text-base transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${hasVoted ? 'text-green-600 bg-green-50' : 'text-[#65676B]'}`}
        >
          <i className={`fa-regular fa-thumbs-up text-lg ${hasVoted ? 'fa-solid animate-bounce' : ''}`}></i> Helpful
        </button>
        <button
          onClick={() => navigate(`/solutions/${post.id}`)}
          className="flex items-center gap-3 hover:bg-gray-100 flex-1 justify-center py-4 rounded-xl text-[#65676B] font-bold text-lg transition-colors"
        >
          <i className="fa-regular fa-comment text-xl"></i> Suggest Solution
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-3 hover:bg-gray-100 flex-1 justify-center py-4 rounded-xl text-[#65676B] font-bold text-lg transition-colors"
        >
          <i className={`fa-solid text-xl ${shareSuccess ? 'fa-check' : 'fa-share'}`}></i> {shareSuccess ? 'Copied!' : 'Share'}
        </button>
      </div>

      {/* Solutions Section */}
      {showSolutions && (
        <div className="px-4 py-4 bg-gray-50 space-y-4 rounded-b-xl">
          {post.solutions.map(sol => (
            <div key={sol.id} className="flex gap-3">
              <img src={sol.userAvatar} className="w-10 h-10 rounded-full" alt={sol.userName} />
              <div className="bg-gray-200 p-3 rounded-2xl max-w-[90%]">
                <p className="font-bold text-sm">{sol.userName}</p>
                <p className="text-base">{sol.text}</p>
                <div className="flex items-center gap-4 mt-2 text-sm font-bold text-gray-500">
                   <span className="hover:underline cursor-pointer">Helpful</span>
                   <span className="hover:underline cursor-pointer">Reply</span>
                   <span>{formatDate(sol.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* New Solution Input */}
          <div className="flex gap-3 items-center">
            <img src={currentUser.avatar} className="w-10 h-10 rounded-full" alt="Me" />
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={newSolution}
                onChange={(e) => setNewSolution(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSolution()}
                placeholder="Suggest a solution..."
                className="w-full bg-[#F0F2F5] px-4 py-3 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3 text-gray-500 text-lg">
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
