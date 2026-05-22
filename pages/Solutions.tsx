import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Post, Solution, SolutionReply } from '../types';

interface SolutionsProps {
  user: User;
  posts: Post[];
  onAddSolution: (postId: string, solution: Solution) => void;
  onAddReply: (postId: string, solutionId: string, reply: SolutionReply) => void;
  onVoteSolution: (postId: string, solutionId: string, delta: number) => void;
}

const Solutions: React.FC<SolutionsProps> = ({ user, posts, onAddSolution, onAddReply, onVoteSolution }) => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [newSolution, setNewSolution] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const post = posts.find(p => p.id === postId);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Post not found</p>
      </div>
    );
  }

  const formatDate = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const handlePostSolution = () => {
    if (!newSolution.trim()) return;
    
    const solution: Solution = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: newSolution,
      timestamp: Date.now(),
      upvotes: 0,
      replies: []
    };

    onAddSolution(post.id, solution);
    setNewSolution('');
  };

  const handlePostReply = (solutionId: string) => {
    if (!replyText.trim()) return;
    
    const reply: SolutionReply = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: replyText,
      timestamp: Date.now()
    };

    onAddReply(post.id, solutionId, reply);
    setReplyText('');
    setReplyingTo(null);
  };

  const toggleReplies = (solutionId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(solutionId)) {
      newExpanded.delete(solutionId);
    } else {
      newExpanded.add(solutionId);
    }
    setExpandedReplies(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-[56px] bg-white border-b border-gray-300 shadow-sm z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 hover:bg-gray-100 rounded-full flex items-center justify-center"
          >
            <i className="fa-solid fa-arrow-left text-gray-700"></i>
          </button>
          <h1 className="text-xl font-bold">Solutions</h1>
        </div>
        <span className="text-gray-600 font-semibold">{post.solutions.length} solutions</span>
      </div>

      <div className="pt-[56px] pb-20 max-w-[680px] mx-auto">
        {/* Original Post */}
        <div className="bg-white m-4 rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <img src={post.userAvatar} className="w-12 h-12 rounded-full object-cover" alt={post.userName} />
            <div>
              <h4 className="font-semibold text-[16px]">{post.userName}</h4>
              <p className="text-gray-500 text-sm">{formatDate(post.timestamp)}</p>
            </div>
          </div>
          {post.title && <h3 className="font-bold text-[18px] mb-2">{post.title}</h3>}
          <p className="text-[15px] whitespace-pre-wrap">{post.content}</p>
          {post.imageUrl && (
            <img src={post.imageUrl} className="w-full rounded-lg mt-3 max-h-[400px] object-cover" alt="Post" />
          )}
        </div>

        {/* All Solutions Section */}
        <div className="px-4">
          <h2 className="text-lg font-bold mb-3">All Solutions</h2>
          
          {post.solutions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fa-regular fa-comment-dots text-3xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 font-semibold">No solutions yet. Be the first to suggest one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {post.solutions.map(solution => (
                <div key={solution.id} className="bg-white rounded-lg shadow-sm p-4">
                  {/* Solution Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <img src={solution.userAvatar} className="w-10 h-10 rounded-full object-cover" alt={solution.userName} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-[15px]">{solution.userName}</h4>
                        <span className="text-gray-500 text-xs">•</span>
                        <span className="text-gray-500 text-xs">{formatDate(solution.timestamp)}</span>
                      </div>
                      <p className="text-[15px] mt-1">{solution.text}</p>
                    </div>
                  </div>

                  {/* Solution Actions */}
                  <div className="flex items-center gap-4 ml-13">
                    <button 
                      onClick={() => onVoteSolution(post.id, solution.id, 1)}
                      className="flex items-center gap-1.5 text-gray-600 hover:text-blue-500 text-sm font-semibold"
                    >
                      <i className="fa-regular fa-thumbs-up"></i>
                      <span>Helpful {solution.upvotes}</span>
                    </button>
                    <button 
                      onClick={() => setReplyingTo(solution.id)}
                      className="flex items-center gap-1.5 text-gray-600 hover:text-blue-500 text-sm font-semibold"
                    >
                      <i className="fa-regular fa-comment"></i>
                      <span>Reply</span>
                    </button>
                    {solution.replies.length > 0 && (
                      <button 
                        onClick={() => toggleReplies(solution.id)}
                        className="flex items-center gap-1.5 text-gray-600 hover:text-blue-500 text-sm font-semibold"
                      >
                        <i className="fa-regular fa-comment-dots"></i>
                        <span>Replies ({solution.replies.length})</span>
                      </button>
                    )}
                  </div>

                  {/* Nested Replies */}
                  {expandedReplies.has(solution.id) && solution.replies.length > 0 && (
                    <div className="ml-13 mt-3 space-y-3">
                      {solution.replies.map(reply => (
                        <div key={reply.id} className="flex items-start gap-2">
                          <img src={reply.userAvatar} className="w-8 h-8 rounded-full object-cover" alt={reply.userName} />
                          <div className="bg-gray-100 p-3 rounded-2xl">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{reply.userName}</span>
                              <span className="text-gray-500 text-xs">{formatDate(reply.timestamp)}</span>
                            </div>
                            <p className="text-sm">{reply.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  {replyingTo === solution.id && (
                    <div className="ml-13 mt-3">
                      <div className="bg-gray-100 rounded-2xl p-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full bg-transparent text-sm resize-none focus:outline-none min-h-[60px]"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button 
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-full"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handlePostReply(solution.id)}
                            className="px-4 py-1.5 text-sm font-semibold text-white bg-[#1877F2] hover:bg-blue-600 rounded-full"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post Solution Input */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-4">
          <div className="max-w-[680px] mx-auto flex items-center gap-3">
            <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="User" />
            <div className="flex-1 relative">
              <input
                type="text"
                value={newSolution}
                onChange={(e) => setNewSolution(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePostSolution()}
                placeholder="Suggest a solution..."
                className="w-full bg-[#F0F2F5] px-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-3 text-gray-500">
                <i className="fa-regular fa-face-smile cursor-pointer hover:text-gray-700"></i>
                <i className="fa-solid fa-image cursor-pointer hover:text-gray-700"></i>
              </div>
            </div>
            <button
              onClick={handlePostSolution}
              disabled={!newSolution.trim()}
              className="px-5 py-2 bg-[#1877F2] hover:bg-blue-600 text-white font-semibold rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post Solution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solutions;
