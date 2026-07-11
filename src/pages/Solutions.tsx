import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Post, Solution, SolutionReply } from '../types';

interface SolutionsProps {
  user: User;
  posts: Post[];
}

const Solutions: React.FC<SolutionsProps> = ({ user, posts }) => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [newSolutionText, setNewSolutionText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (postId) {
      const foundPost = posts.find(p => p.id === postId);
      if (foundPost) {
        setPost(foundPost);
      }
    }
  }, [postId, posts]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handlePostSolution = () => {
    if (!newSolutionText.trim() || !post) return;

    const newSolution: Solution = {
      id: `solution-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: newSolutionText,
      timestamp: Date.now(),
      upvotes: 0,
      helpful: 0,
      replies: [],
    };

    const updatedPost = {
      ...post,
      solutions: [...post.solutions, newSolution],
    };

    setPost(updatedPost);
    setNewSolutionText('');
  };

  const handleHelpful = (solutionId: string) => {
    if (!post) return;
    const updatedSolutions = post.solutions.map(s => 
      s.id === solutionId ? { ...s, helpful: s.helpful + 1 } : s
    );
    setPost({ ...post, solutions: updatedSolutions });
  };

  const handleReply = (solutionId: string) => {
    if (!replyText.trim() || !post) return;

    const newReply: SolutionReply = {
      id: `reply-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: replyText,
      timestamp: Date.now(),
    };

    const updatedSolutions = post.solutions.map(s => 
      s.id === solutionId 
        ? { ...s, replies: [...s.replies, newReply] }
        : s
    );

    setPost({ ...post, solutions: updatedSolutions });
    setReplyText('');
    setReplyingTo(null);
  };

  const toggleReplies = (solutionId: string) => {
    setShowReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(solutionId)) {
        newSet.delete(solutionId);
      } else {
        newSet.add(solutionId);
      }
      return newSet;
    });
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Back Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#1877F2] font-semibold">
          <i className="fa-solid fa-arrow-left text-xl"></i>
          <span>Back</span>
        </button>
      </div>

      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 z-10">
        <button onClick={() => navigate(-1)} className="hidden md:block p-2 hover:bg-gray-100 rounded-full">
          <i className="fa-solid fa-arrow-left text-gray-700 text-lg"></i>
        </button>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Solutions</h1>
        <span className="text-gray-500 text-sm sm:text-base">{post.solutions.length} solutions</span>
      </div>

      {/* Original Post */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200">
        <div className="flex items-start gap-3 sm:gap-4">
          <img 
            src={post.userAvatar} 
            alt={post.userName} 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm sm:text-base">{post.userName}</span>
              <span className="text-gray-500 text-xs sm:text-sm">{formatTimeAgo(post.timestamp)}</span>
            </div>
            <p className="text-gray-800 mt-1 text-sm sm:text-base font-medium">{post.title}</p>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">{post.content}</p>
          </div>
        </div>
      </div>

      {/* All Solutions Section */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">All Solutions</h2>

        {post.solutions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <i className="fa-regular fa-comment text-5xl mb-4 text-gray-300"></i>
            <p className="text-center">No solutions yet. Be the first to suggest one!</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {post.solutions.map((solution) => (
              <div key={solution.id} className="border border-gray-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <img 
                    src={solution.userAvatar} 
                    alt={solution.userName} 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{solution.userName}</span>
                      <span className="text-gray-500 text-xs sm:text-sm">{formatTimeAgo(solution.timestamp)}</span>
                    </div>
                    <p className="text-gray-800 mt-1 text-sm sm:text-base">{solution.text}</p>

                    {/* Interaction Buttons */}
                    <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
                      <button 
                        onClick={() => handleHelpful(solution.id)}
                        className="flex items-center gap-1.5 sm:gap-2 text-gray-500 hover:text-green-600 transition-colors text-sm sm:text-base"
                      >
                        <i className="fa-regular fa-thumbs-up text-sm sm:text-base"></i>
                        <span className="text-sm sm:text-base">Helpful {solution.helpful}</span>
                      </button>
                      <button 
                        onClick={() => setReplyingTo(solution.id)}
                        className="flex items-center gap-1.5 sm:gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm sm:text-base"
                      >
                        <i className="fa-regular fa-comment text-sm sm:text-base"></i>
                        <span className="text-sm sm:text-base">Reply</span>
                      </button>
                      {solution.replies.length > 0 && (
                        <button 
                          onClick={() => toggleReplies(solution.id)}
                          className="flex items-center gap-1.5 sm:gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm sm:text-base"
                        >
                          <i className="fa-regular fa-comment text-sm sm:text-base"></i>
                          <span className="text-sm sm:text-base">Replies ({solution.replies.length})</span>
                        </button>
                      )}
                    </div>

                    {/* Reply Input */}
                    {replyingTo === solution.id && (
                      <div className="mt-4 sm:mt-6 flex items-start gap-3 sm:gap-4">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-2 sm:mt-3">
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-4 py-1.5 sm:px-5 sm:py-2 text-gray-600 hover:bg-gray-100 rounded-full text-sm sm:text-base"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReply(solution.id)}
                              className="px-4 py-1.5 sm:px-5 sm:py-2 bg-blue-500 text-white rounded-full text-sm sm:text-base hover:bg-blue-600"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {showReplies.has(solution.id) && solution.replies.length > 0 && (
                      <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 pl-4 sm:pl-6 border-l-2 border-gray-200">
                        {solution.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3 sm:gap-4">
                            <img 
                              src={reply.userAvatar} 
                              alt={reply.userName} 
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 text-xs sm:text-sm">{reply.userName}</span>
                                <span className="text-gray-500 text-[10px] sm:text-xs">{formatTimeAgo(reply.timestamp)}</span>
                              </div>
                              <p className="text-gray-700 text-xs sm:text-sm mt-1">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Solution Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
          />
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5 sm:py-3">
            <input
              type="text"
              placeholder="Suggest a solution..."
              value={newSolutionText}
              onChange={(e) => setNewSolutionText(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-gray-800 text-sm sm:text-base"
            />
            <button className="text-gray-500 hover:text-gray-700">
              <i className="fa-regular fa-face-smile text-lg sm:text-xl"></i>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <i className="fa-solid fa-paperclip text-lg sm:text-xl"></i>
            </button>
          </div>
          <button
            onClick={handlePostSolution}
            disabled={!newSolutionText.trim()}
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-500 text-white rounded-full text-sm sm:text-base font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post Solution
          </button>
        </div>
      </div>
    </div>
  );
};

export default Solutions;
