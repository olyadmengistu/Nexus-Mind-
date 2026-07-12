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
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 sm:py-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 sm:gap-3 text-[#1877F2] font-semibold text-base sm:text-lg">
          <i className="fa-solid fa-arrow-left text-xl sm:text-2xl"></i>
          <span>Back</span>
        </button>
      </div>

      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-4 z-10">
        <button onClick={() => navigate(-1)} className="hidden md:block p-2 sm:p-3 hover:bg-gray-100 rounded-full">
          <i className="fa-solid fa-arrow-left text-gray-700 text-lg sm:text-xl"></i>
        </button>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">Solutions</h1>
        <span className="text-gray-500 text-sm sm:text-base lg:text-lg">{post.solutions.length} solutions</span>
      </div>

      {/* Original Post */}
      <div className="px-4 sm:px-6 py-5 sm:py-6 lg:py-8 border-b border-gray-200">
        <div className="flex items-start gap-3 sm:gap-4 lg:gap-5">
          <img 
            src={post.userAvatar} 
            alt={post.userName} 
            className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="font-semibold text-gray-900 text-base sm:text-lg lg:text-xl">{post.userName}</span>
              <span className="text-gray-500 text-xs sm:text-sm lg:text-base">{formatTimeAgo(post.timestamp)}</span>
            </div>
            <p className="text-gray-800 mt-2 sm:mt-3 text-base sm:text-lg lg:text-xl font-medium">{post.title}</p>
            <p className="text-gray-600 mt-1 sm:mt-2 text-base sm:text-lg lg:text-xl">{post.content}</p>
          </div>
        </div>
      </div>

      {/* All Solutions Section */}
      <div className="px-4 sm:px-6 py-5 sm:py-6 lg:py-8 pb-24 sm:pb-28">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 lg:mb-8">All Solutions</h2>

        {post.solutions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-gray-500">
            <i className="fa-regular fa-comment text-6xl sm:text-7xl lg:text-8xl mb-6 text-gray-300"></i>
            <p className="text-center text-base sm:text-lg lg:text-xl">No solutions yet. Be the first to suggest one!</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {post.solutions.map((solution) => (
              <div key={solution.id} className="border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
                <div className="flex items-start gap-3 sm:gap-4 lg:gap-5">
                  <img 
                    src={solution.userAvatar} 
                    alt={solution.userName} 
                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="font-semibold text-gray-900 text-base sm:text-lg lg:text-xl">{solution.userName}</span>
                      <span className="text-gray-500 text-xs sm:text-sm lg:text-base">{formatTimeAgo(solution.timestamp)}</span>
                    </div>
                    <p className="text-gray-800 mt-2 sm:mt-3 text-base sm:text-lg lg:text-xl">{solution.text}</p>

                    {/* Interaction Buttons */}
                    <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 mt-4 sm:mt-5 lg:mt-6">
                      <button 
                        onClick={() => handleHelpful(solution.id)}
                        className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 text-gray-500 hover:text-green-600 transition-colors text-sm sm:text-base lg:text-lg"
                      >
                        <i className="fa-regular fa-thumbs-up text-base sm:text-lg lg:text-xl"></i>
                        <span className="text-sm sm:text-base lg:text-lg">Helpful {solution.helpful}</span>
                      </button>
                      <button 
                        onClick={() => setReplyingTo(solution.id)}
                        className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 text-gray-500 hover:text-blue-600 transition-colors text-sm sm:text-base lg:text-lg"
                      >
                        <i className="fa-regular fa-comment text-base sm:text-lg lg:text-xl"></i>
                        <span className="text-sm sm:text-base lg:text-lg">Reply</span>
                      </button>
                      {solution.replies.length > 0 && (
                        <button 
                          onClick={() => toggleReplies(solution.id)}
                          className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 text-gray-500 hover:text-blue-600 transition-colors text-sm sm:text-base lg:text-lg"
                        >
                          <i className="fa-regular fa-comment text-base sm:text-lg lg:text-xl"></i>
                          <span className="text-sm sm:text-base lg:text-lg">Replies ({solution.replies.length})</span>
                        </button>
                      )}
                    </div>

                    {/* Reply Input */}
                    {replyingTo === solution.id && (
                      <div className="mt-4 sm:mt-6 lg:mt-8 flex items-start gap-3 sm:gap-4 lg:gap-5">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 lg:py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base lg:text-lg"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 sm:gap-3 mt-3 sm:mt-4">
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 text-gray-600 hover:bg-gray-100 rounded-full text-sm sm:text-base lg:text-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReply(solution.id)}
                              className="px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 bg-blue-500 text-white rounded-full text-sm sm:text-base lg:text-lg hover:bg-blue-600"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {showReplies.has(solution.id) && solution.replies.length > 0 && (
                      <div className="mt-4 sm:mt-6 lg:mt-8 space-y-3 sm:space-y-4 lg:space-y-5 pl-4 sm:pl-6 lg:pl-8 border-l-2 border-gray-200">
                        {solution.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3 sm:gap-4 lg:gap-5">
                            <img 
                              src={reply.userAvatar} 
                              alt={reply.userName} 
                              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">{reply.userName}</span>
                                <span className="text-gray-500 text-[10px] sm:text-xs lg:text-sm">{formatTimeAgo(reply.timestamp)}</span>
                              </div>
                              <p className="text-gray-700 text-xs sm:text-sm lg:text-base mt-1">{reply.text}</p>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full object-cover"
          />
          <div className="flex-1 flex items-center gap-2 sm:gap-3 bg-gray-100 rounded-full px-4 sm:px-5 py-3 sm:py-3.5 lg:py-4">
            <input
              type="text"
              placeholder="Suggest..."
              value={newSolutionText}
              onChange={(e) => setNewSolutionText(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-gray-800 text-sm sm:text-base lg:text-lg"
            />
            <button className="text-gray-500 hover:text-gray-700">
              <i className="fa-regular fa-face-smile text-lg sm:text-xl lg:text-2xl"></i>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <i className="fa-solid fa-paperclip text-lg sm:text-xl lg:text-2xl"></i>
            </button>
          </div>
          <button
            onClick={handlePostSolution}
            disabled={!newSolutionText.trim()}
            className="px-3 py-2 sm:px-4 sm:py-2.5 lg:px-5 lg:py-3 bg-blue-500 text-white rounded-full text-sm sm:text-base lg:text-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <span className="hidden sm:inline">Post</span>
            <span className="sm:hidden">Post</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Solutions;
