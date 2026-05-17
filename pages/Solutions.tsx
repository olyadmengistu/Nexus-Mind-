import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Post, User, Solution, SolutionReply } from '../types';

interface SolutionsProps {
  user: User;
  posts: Post[];
  onUpdatePost: (post: Post) => void;
}

const Solutions: React.FC<SolutionsProps> = ({ user, posts, onUpdatePost }) => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  
  const post = posts.find(p => p.id === postId);
  const [newSolution, setNewSolution] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  const handleAddSolution = () => {
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

    const updatedPost = {
      ...post,
      solutions: [...post.solutions, solution]
    };
    
    onUpdatePost(updatedPost);
    setNewSolution('');
  };

  const handleAddReply = (solutionId: string) => {
    if (!replyText.trim()) return;
    
    const reply: SolutionReply = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: replyText,
      timestamp: Date.now(),
      upvotes: 0
    };

    const updatedPost = {
      ...post,
      solutions: post.solutions.map(sol => 
        sol.id === solutionId 
          ? { ...sol, replies: [...sol.replies, reply] }
          : sol
      )
    };
    
    onUpdatePost(updatedPost);
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

  const handleUpvoteSolution = (solutionId: string) => {
    const updatedPost = {
      ...post,
      solutions: post.solutions.map(sol => 
        sol.id === solutionId 
          ? { ...sol, upvotes: sol.upvotes + 1 }
          : sol
      )
    };
    onUpdatePost(updatedPost);
  };

  const handleUpvoteReply = (solutionId: string, replyId: string) => {
    const updatedPost = {
      ...post,
      solutions: post.solutions.map(sol => 
        sol.id === solutionId 
          ? {
              ...sol,
              replies: sol.replies.map(rep => 
                rep.id === replyId 
                  ? { ...rep, upvotes: rep.upvotes + 1 }
                  : rep
              )
            }
          : sol
      )
    };
    onUpdatePost(updatedPost);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[680px] mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-gray-700"></i>
          </button>
          <h1 className="font-bold text-[17px]">Solutions</h1>
          <span className="text-gray-600 text-[15px] font-semibold">{post.solutions.length} solutions</span>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4 py-4 space-y-4">
        {/* Original Post */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <img src={post.userAvatar} className="w-10 h-10 rounded-full object-cover" alt={post.userName} />
            <div>
              <h4 className="font-semibold text-[15px]">{post.userName}</h4>
              <p className="text-gray-500 text-[13px]">{formatDate(post.timestamp)}</p>
            </div>
          </div>
          {post.title && <h3 className="font-bold text-[17px] mb-2">{post.title}</h3>}
          <p className="text-[15px] whitespace-pre-wrap">{post.content}</p>
          {post.imageUrl && (
            <img src={post.imageUrl} className="w-full rounded-lg mt-3 max-h-[400px] object-cover" alt="Post" />
          )}
        </div>

        {/* All Solutions Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-[17px]">All Solutions</h2>
          </div>

          {post.solutions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fa-regular fa-comment-dots text-3xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 text-[15px]">No solutions yet. Be the first to suggest one!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {post.solutions.map((solution) => (
                <div key={solution.id} className="p-4">
                  {/* Solution */}
                  <div className="flex gap-3">
                    <img src={solution.userAvatar} className="w-10 h-10 rounded-full object-cover" alt={solution.userName} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-[15px]">{solution.userName}</h4>
                        <span className="text-gray-500 text-[13px]">{formatDate(solution.timestamp)}</span>
                      </div>
                      <p className="text-[15px] mb-3">{solution.text}</p>
                      
                      {/* Solution Actions */}
                      <div className="flex items-center gap-4 text-[13px] font-semibold text-gray-500">
                        <button 
                          onClick={() => handleUpvoteSolution(solution.id)}
                          className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                        >
                          <i className="fa-regular fa-thumbs-up"></i>
                          <span>Helpful {solution.upvotes > 0 && solution.upvotes}</span>
                        </button>
                        <button 
                          onClick={() => setReplyingTo(solution.id)}
                          className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                        >
                          <i className="fa-regular fa-comment"></i>
                          <span>Reply</span>
                        </button>
                        {solution.replies.length > 0 && (
                          <button 
                            onClick={() => toggleReplies(solution.id)}
                            className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                          >
                            <i className="fa-regular fa-comment"></i>
                            <span>Replies ({solution.replies.length})</span>
                          </button>
                        )}
                      </div>

                      {/* Reply Input */}
                      {replyingTo === solution.id && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-3">
                          <div className="flex gap-2">
                            <img src={user.avatar} className="w-8 h-8 rounded-full" alt="You" />
                            <div className="flex-1">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                rows={2}
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <button 
                                  onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                  className="px-4 py-1.5 text-sm font-semibold text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => handleAddReply(solution.id)}
                                  className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Nested Replies */}
                      {expandedReplies.has(solution.id) && solution.replies.length > 0 && (
                        <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
                          {solution.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-2">
                              <img src={reply.userAvatar} className="w-8 h-8 rounded-full object-cover" alt={reply.userName} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-[14px]">{reply.userName}</h4>
                                  <span className="text-gray-500 text-[12px]">{formatDate(reply.timestamp)}</span>
                                </div>
                                <p className="text-[14px] mb-2">{reply.text}</p>
                                <button 
                                  onClick={() => handleUpvoteReply(solution.id, reply.id)}
                                  className="flex items-center gap-1 text-[12px] font-semibold text-gray-500 hover:text-blue-500 transition-colors"
                                >
                                  <i className="fa-regular fa-thumbs-up"></i>
                                  <span>Helpful {reply.upvotes > 0 && reply.upvotes}</span>
                                </button>
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

          {/* New Solution Input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-3">
              <img src={user.avatar} className="w-10 h-10 rounded-full" alt="You" />
              <div className="flex-1 relative">
                <textarea
                  value={newSolution}
                  onChange={(e) => setNewSolution(e.target.value)}
                  placeholder="Suggest a solution..."
                  className="w-full bg-[#F0F2F5] px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  rows={2}
                />
                <div className="absolute right-3 bottom-3 flex gap-3 text-gray-500">
                  <i className="fa-regular fa-face-smile cursor-pointer hover:text-gray-700"></i>
                  <i className="fa-solid fa-camera cursor-pointer hover:text-gray-700"></i>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button 
                onClick={handleAddSolution}
                disabled={!newSolution.trim()}
                className="px-6 py-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Post Solution
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solutions;
