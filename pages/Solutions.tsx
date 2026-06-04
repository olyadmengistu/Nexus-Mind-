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
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <i className="fa-solid fa-arrow-left text-gray-700 text-lg"></i>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Solutions</h1>
        <span className="text-gray-500 text-sm">{post.solutions.length} solutions</span>
      </div>

      {/* Original Post */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-start gap-3">
          <img 
            src={post.userAvatar} 
            alt={post.userName} 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{post.userName}</span>
              <span className="text-gray-500 text-sm">{formatTimeAgo(post.timestamp)}</span>
            </div>
            <p className="text-gray-800 mt-1">{post.title}</p>
            <p className="text-gray-600 mt-1">{post.content}</p>
          </div>
        </div>
      </div>

      {/* All Solutions Section */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Solutions</h2>

        {post.solutions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <i className="fa-regular fa-comment text-5xl mb-4 text-gray-300"></i>
            <p className="text-center">No solutions yet. Be the first to suggest one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {post.solutions.map((solution) => (
              <div key={solution.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <img 
                    src={solution.userAvatar} 
                    alt={solution.userName} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{solution.userName}</span>
                      <span className="text-gray-500 text-sm">{formatTimeAgo(solution.timestamp)}</span>
                    </div>
                    <p className="text-gray-800 mt-1">{solution.text}</p>

                    {/* Interaction Buttons */}
                    <div className="flex items-center gap-4 mt-3">
                      <button 
                        onClick={() => handleHelpful(solution.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors"
                      >
                        <i className="fa-regular fa-thumbs-up text-sm"></i>
                        <span className="text-sm">Helpful {solution.helpful}</span>
                      </button>
                      <button 
                        onClick={() => setReplyingTo(solution.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <i className="fa-regular fa-comment text-sm"></i>
                        <span className="text-sm">Reply</span>
                      </button>
                      {solution.replies.length > 0 && (
                        <button 
                          onClick={() => toggleReplies(solution.id)}
                          className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <i className="fa-regular fa-comment text-sm"></i>
                          <span className="text-sm">Replies ({solution.replies.length})</span>
                        </button>
                      )}
                    </div>

                    {/* Reply Input */}
                    {replyingTo === solution.id && (
                      <div className="mt-4 flex items-start gap-3">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-4 py-1.5 text-gray-600 hover:bg-gray-100 rounded-full text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReply(solution.id)}
                              className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {showReplies.has(solution.id) && solution.replies.length > 0 && (
                      <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                        {solution.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <img 
                              src={reply.userAvatar} 
                              alt={reply.userName} 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 text-sm">{reply.userName}</span>
                                <span className="text-gray-500 text-xs">{formatTimeAgo(reply.timestamp)}</span>
                              </div>
                              <p className="text-gray-700 text-sm mt-1">{reply.text}</p>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="Suggest a solution..."
              value={newSolutionText}
              onChange={(e) => setNewSolutionText(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-gray-800"
            />
            <button className="text-gray-500 hover:text-gray-700">
              <i className="fa-regular fa-face-smile text-lg"></i>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <i className="fa-solid fa-paperclip text-lg"></i>
            </button>
          </div>
          <button
            onClick={handlePostSolution}
            disabled={!newSolutionText.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post Solution
          </button>
        </div>
      </div>
    </div>
  );
};

export default Solutions;
