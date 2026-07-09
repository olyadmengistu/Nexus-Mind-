
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post, User, Solution } from '../types';
import { solutionsApi, commentsApi, postsApi, userApi } from '../lib/firebaseApi';

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
  const [localPost, setLocalPost] = useState(post);
  const [showMenu, setShowMenu] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [solutionVotes, setSolutionVotes] = useState<Record<string, 'up' | 'down' | null>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editContent, setEditContent] = useState(post.content || '');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load comments when solutions section is shown
  useEffect(() => {
    if (showSolutions && comments.length === 0) {
      loadComments();
    }
  }, [showSolutions]);

  // Check if user is following the post author
  useEffect(() => {
    if (currentUser.following && post.userId !== currentUser.id) {
      setIsFollowing(currentUser.following.includes(post.userId));
    }
  }, [currentUser.following, post.userId, currentUser.id]);

  // Check if user has saved the post
  useEffect(() => {
    if (currentUser.savedItems) {
      setIsSaved(currentUser.savedItems.some((item: any) => item.itemId === post.id));
    }
  }, [currentUser.savedItems, post.id]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const fetchedComments = await commentsApi.getComments(post.id);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const comment = await commentsApi.addComment(post.id, currentUser.id, newComment);
      setComments([...comments, {
        id: comment.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        text: newComment,
        timestamp: Date.now(),
      }]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      // Fallback to local update
      const localComment = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        text: newComment,
        timestamp: Date.now(),
      };
      setComments([...comments, localComment]);
      setNewComment('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsApi.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleSolutionVote = async (solutionId: string, voteType: 'up' | 'down') => {
    const currentVote = solutionVotes[solutionId];
    const newVote = currentVote === voteType ? null : voteType;
    
    // Update local state
    setSolutionVotes(prev => ({ ...prev, [solutionId]: newVote }));
    
    // Update solution upvotes locally
    const delta = newVote === 'up' ? 1 : newVote === 'down' ? -1 : currentVote === 'up' ? -1 : 1;
    setLocalPost(prev => ({
      ...prev,
      solutions: prev.solutions.map(sol =>
        sol.id === solutionId ? { ...sol, upvotes: Math.max(0, (sol.upvotes || 0) + delta) } : sol
      )
    }));

    try {
      await solutionsApi.voteSolution(solutionId, currentUser.id, newVote || 'up');
    } catch (error) {
      console.error('Failed to vote on solution:', error);
      // Revert on error
      setSolutionVotes(prev => ({ ...prev, [solutionId]: currentVote }));
    }
  };

  const handleMarkHelpful = async (solutionId: string, isHelpful: boolean) => {
    try {
      await solutionsApi.markHelpful(solutionId, isHelpful);
      setLocalPost(prev => ({
        ...prev,
        solutions: prev.solutions.map(sol =>
          sol.id === solutionId ? { ...sol, helpful: isHelpful ? (sol.helpful || 0) + 1 : Math.max(0, (sol.helpful || 0) - 1) } : sol
        )
      }));
    } catch (error) {
      console.error('Failed to mark solution as helpful:', error);
    }
  };

  const handleEditPost = async () => {
    if (!editTitle.trim() && !editContent.trim()) return;
    
    try {
      await postsApi.updatePost(post.id, { title: editTitle, content: editContent });
      setLocalPost(prev => ({ ...prev, title: editTitle, content: editContent }));
      setIsEditing(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post. Please try again.');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    
    try {
      await postsApi.deletePost(post.id);
      setShowMenu(false);
      // Navigate back to feed or refresh
      navigate('/');
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleVoteClick = async () => {
    const newVoteState = !hasVoted;
    const delta = newVoteState ? 1 : -1;
    
    // Update local state immediately for responsiveness
    setHasVoted(newVoteState);
    setLocalPost(prev => ({ ...prev, votes: prev.votes + delta }));
    
    // Call parent handler
    onVote(post.id, delta);
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

  const handleAddSolution = async () => {
    if (!newSolution.trim()) return;
    
    try {
      const solution = await solutionsApi.addSolution(post.id, currentUser.id, newSolution);
      
      setLocalPost(prev => ({
        ...prev,
        solutions: [...prev.solutions, {
          id: solution.id,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          text: newSolution,
          timestamp: Date.now(),
          upvotes: 0,
          helpful: 0,
          replies: []
        }]
      }));
      setNewSolution('');
    } catch (error) {
      console.error('Failed to add solution:', error);
      // Fallback to local update
      const solution: Solution = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        text: newSolution,
        timestamp: Date.now(),
        upvotes: 0,
        helpful: 0,
        replies: []
      };
      setLocalPost(prev => ({
        ...prev,
        solutions: [...prev.solutions, solution]
      }));
      setNewSolution('');
    }
  };

  const handleFollow = async () => {
    if (post.userId === currentUser.id) return;
    
    try {
      if (isFollowing) {
        await userApi.unfollowUser(currentUser.id, post.userId);
        setIsFollowing(false);
      } else {
        await userApi.followUser(currentUser.id, post.userId);
        setIsFollowing(true);
      }
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error);
      alert('Failed to follow user. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      const savedItem = {
        id: post.id,
        userId: currentUser.id,
        itemType: 'post' as const,
        itemId: post.id,
        title: post.title || post.content.substring(0, 50),
        description: post.content.substring(0, 100),
        thumbnail: post.imageUrl,
        url: `/post/${post.id}`,
        timestamp: Date.now()
      };
      
      if (isSaved) {
        await userApi.removeSavedItem(currentUser.id, post.id);
        setIsSaved(false);
      } else {
        await userApi.saveItem(currentUser.id, savedItem);
        setIsSaved(true);
      }
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to save/unsave post:', error);
      alert('Failed to save post. Please try again.');
    }
  };


  const formatDate = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="bg-white sm:rounded-xl shadow-sm overflow-hidden mb-4 sm:mb-0">
      {/* Header */}
      <div className="p-4 sm:p-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3 sm:gap-3">
          <div className="relative">
             <img src={post.userAvatar} className="w-12 h-12 sm:w-12 sm:h-12 rounded-full object-cover" alt={post.userName} />
             {post.isSolved && (
               <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 sm:p-1 rounded-full border-2 border-white text-xs sm:text-xs">
                 <i className="fa-solid fa-check text-xs sm:text-xs"></i>
               </div>
             )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-1.5 sm:gap-2">
              <h4 className="font-bold text-sm sm:text-sm sm:text-base leading-tight cursor-pointer hover:underline truncate max-w-[150px] sm:max-w-[150px] sm:max-w-none">{post.userName}</h4>
              <span className="text-gray-500 text-xs sm:text-sm">•</span>
              <span className="bg-blue-100 text-blue-600 px-2 sm:px-2 sm:px-3 py-1 sm:py-1 rounded-full text-xs sm:text-[10px] sm:text-xs font-bold uppercase">{post.category}</span>
              {post.privacy && (
                <>
                  <span className="text-gray-500 text-xs sm:text-sm">•</span>
                  <span className="text-gray-500 text-xs sm:text-xs">
                    {post.privacy === 'private' && <i className="fa-solid fa-lock"></i>}
                    {post.privacy === 'friends' && <i className="fa-solid fa-user-group"></i>}
                    {post.privacy === 'public' && <i className="fa-solid fa-globe"></i>}
                  </span>
                </>
              )}
            </div>
            <p className="text-gray-500 text-xs sm:text-xs sm:text-sm">
              {post.scheduledTime && post.scheduledTime > Date.now() ? (
                <>
                  <i className="fa-solid fa-clock text-xs sm:text-xs"></i> {formatDate(post.scheduledTime)}
                </>
              ) : (
                <>
                  {formatDate(post.timestamp)}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-500 hover:bg-gray-100 w-10 h-10 sm:w-10 sm:h-10 rounded-full transition-colors"
          >
            <i className="fa-solid fa-ellipsis text-base sm:text-lg"></i>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg border border-gray-200 py-2 w-48 z-50">
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate(`/post/${post.id}`);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm font-medium"
              >
                View Post Details
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm font-medium"
              >
                Copy Link
              </button>
              {post.userId !== currentUser.id && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleFollow();
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm font-medium"
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleSave();
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm font-medium"
              >
                {isSaved ? 'Unsave' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowSolutions(!showSolutions);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm font-medium"
              >
                {showSolutions ? 'Hide' : 'Show'} Solutions
              </button>
              {post.userId === currentUser.id && (
                <>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditing(true);
                      setEditTitle(localPost.title || '');
                      setEditContent(localPost.content || '');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm font-medium"
                  >
                    Edit Post
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDeletePost();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm font-medium text-red-600"
                  >
                    Delete Post
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowMenu(false);
                  // TODO: Implement report functionality
                  alert('Report functionality coming soon');
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm font-medium"
              >
                Report Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-4 pb-4 sm:pb-3 space-y-3 sm:space-y-3">
        {isEditing ? (
          <div className="space-y-2 sm:space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditPost}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(localPost.title || '');
                  setEditContent(localPost.content || '');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {localPost.title && <h3 className="font-bold text-sm sm:text-sm sm:text-base sm:text-lg">{localPost.title}</h3>}
            <p className="text-sm sm:text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">{localPost.content}</p>
          </>
        )}
        
        {/* Emoji Display */}
        {post.emoji && (
          <div className="flex flex-wrap items-center gap-3 sm:gap-3 text-base sm:text-base text-gray-600">
            <span className="text-3xl">{post.emoji}</span>
            <span className="font-medium text-sm">feeling</span>
          </div>
        )}

        {/* Location Display */}
        {post.location && (
          <div className="flex flex-wrap items-center gap-3 sm:gap-3 text-base sm:text-base text-gray-600">
            <i className="fa-solid fa-location-dot text-[#F3425E] text-2xl"></i>
            <span className="font-medium text-sm">{post.location}</span>
            {post.locationCoordinates && (
              <a
                href={`https://www.google.com/maps?q=${post.locationCoordinates.latitude},${post.locationCoordinates.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
              >
                <i className="fa-solid fa-external-link"></i> View on map
              </a>
            )}
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

      {/* Video */}
      {post.videoUrl && (
        <div className="w-full h-auto border-y border-gray-100">
          <video src={post.videoUrl} controls className="w-full max-h-[500px]" />
        </div>
      )}

      {/* GIF */}
      {post.gifUrl && (
        <div className="w-full h-auto border-y border-gray-100">
          <img src={post.gifUrl} className="w-full object-cover max-h-[500px]" alt="GIF Content" />
        </div>
      )}

      {/* Poll */}
      {post.poll && (
        <div className="px-4 py-3 border-y border-gray-100">
          <h4 className="font-semibold mb-3">{post.poll.question}</h4>
          <div className="space-y-2">
            {post.poll.options.map((option) => {
              const totalVotes = post.poll!.options.reduce((sum, opt) => sum + opt.votes, 0);
              const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
              return (
                <button
                  key={option.id}
                  className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative overflow-hidden"
                >
                  <div 
                    className="absolute inset-0 bg-blue-100 transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <div className="relative flex justify-between items-center">
                    <span className="font-medium">{option.text}</span>
                    <span className="text-sm text-gray-600">{percentage}% ({option.votes} votes)</span>
                  </div>
                </button>
              );
            })}
          </div>
          {post.poll.expiresAt && (
            <p className="text-xs text-gray-500 mt-2">
              Poll expires {formatDate(post.poll.expiresAt)}
            </p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="px-4 sm:px-4 py-3 sm:py-3 flex flex-col gap-2 sm:gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100">
        <div className="flex items-center gap-2 sm:gap-2 cursor-pointer hover:underline group">
          <div className="flex -space-x-1">
             <div className="bg-blue-500 w-5 h-5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs sm:text-xs text-white">
               <i className="fa-solid fa-thumbs-up text-xs sm:text-xs"></i>
             </div>
             <div className="bg-yellow-500 w-5 h-5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs sm:text-xs text-white">
               <i className="fa-solid fa-lightbulb text-xs sm:text-xs"></i>
             </div>
          </div>
          <span className="text-gray-500 text-sm sm:text-sm sm:text-base font-medium">{localPost.votes}</span>
        </div>
        <div className="flex gap-4 sm:gap-4 text-sm sm:text-sm sm:text-base text-gray-500 font-medium">
           <button 
             onClick={() => setShowSolutions(!showSolutions)}
             className="hover:underline cursor-pointer"
           >
             {localPost.solutions.length}
           </button>
           <span className="hover:underline cursor-pointer">{shareSuccess ? '13' : '12'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-2 sm:px-4 py-3 sm:py-2 flex items-center justify-around">
        <button
          onClick={handleVoteClick}
          className={`flex items-center gap-2 sm:gap-1.5 sm:gap-3 hover:bg-gray-100 flex-1 justify-center py-3 sm:py-2.5 sm:py-4 rounded-xl font-bold text-sm sm:text-xs sm:text-lg transition-all hover:scale-105 active:scale-95 ${hasVoted ? 'text-blue-500' : 'text-[#65676B]'}`}
        >
          <i className={`fa-regular fa-thumbs-up text-lg sm:text-lg sm:text-xl ${hasVoted ? 'fa-solid' : ''}`}></i> <span className="hidden sm:inline">Helpful</span><span className="sm:hidden">Help</span>
        </button>
        <button
          onClick={() => navigate(`/solutions/${post.id}`)}
          className="flex items-center gap-2 sm:gap-1.5 sm:gap-3 hover:bg-gray-100 flex-1 justify-center py-3 sm:py-2.5 sm:py-4 rounded-xl text-[#65676B] font-bold text-sm sm:text-xs sm:text-lg transition-colors"
        >
          <i className="fa-regular fa-lightbulb text-lg sm:text-lg sm:text-xl"></i> <span className="hidden sm:inline">Solution</span><span className="sm:hidden">Solve</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 sm:gap-1.5 sm:gap-3 hover:bg-gray-100 flex-1 justify-center py-3 sm:py-2.5 sm:py-4 rounded-xl text-[#65676B] font-bold text-sm sm:text-xs sm:text-lg transition-colors"
        >
          <i className={`fa-solid text-lg sm:text-lg sm:text-xl ${shareSuccess ? 'fa-check' : 'fa-share'}`}></i> {shareSuccess ? 'Copied!' : 'Share'}
        </button>
      </div>


      {/* Solutions Section */}
      {showSolutions && (
        <div className="px-3 sm:px-4 py-4 bg-gray-50 space-y-4 rounded-b-xl">
          {/* Comments Section */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-gray-700">Comments ({comments.length})</h4>
            {loadingComments ? (
              <p className="text-sm text-gray-500">Loading comments...</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <img src={comment.userAvatar} className="w-8 h-8 rounded-full" alt={comment.userName} />
                  <div className="flex-1">
                    <div className="bg-white p-3 rounded-2xl shadow-sm">
                      <p className="font-bold text-xs">{comment.userName}</p>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{formatDate(comment.timestamp)}</span>
                      {comment.userId === currentUser.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* New Comment Input */}
            <div className="flex gap-3 items-center mt-3">
              <img src={currentUser.avatar} className="w-8 h-8 rounded-full" alt="Me" />
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Write a comment..."
                  className="w-full bg-white px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Solutions */}
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <h4 className="font-bold text-sm text-gray-700">Solutions ({localPost.solutions.length})</h4>
            {localPost.solutions.map(sol => (
              <div key={sol.id} className="flex gap-3">
                <img src={sol.userAvatar} className="w-10 h-10 rounded-full" alt={sol.userName} />
                <div className="bg-gray-200 p-3 rounded-2xl max-w-[calc(100%-52px)] sm:max-w-[90%]">
                  <p className="font-bold text-sm">{sol.userName}</p>
                  <p className="text-base">{sol.text}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm font-bold text-gray-500">
                     <button 
                       onClick={() => handleSolutionVote(sol.id, 'up')}
                       className={`hover:underline cursor-pointer flex items-center gap-1 ${solutionVotes[sol.id] === 'up' ? 'text-blue-500' : ''}`}
                     >
                       <i className={`fa-solid fa-thumbs-up ${solutionVotes[sol.id] === 'up' ? '' : 'fa-regular'}`}></i>
                       {sol.upvotes || 0}
                     </button>
                     <button 
                       onClick={() => handleSolutionVote(sol.id, 'down')}
                       className={`hover:underline cursor-pointer flex items-center gap-1 ${solutionVotes[sol.id] === 'down' ? 'text-red-500' : ''}`}
                     >
                       <i className={`fa-solid fa-thumbs-down ${solutionVotes[sol.id] === 'down' ? '' : 'fa-regular'}`}></i>
                     </button>
                     <button 
                       onClick={() => handleMarkHelpful(sol.id, true)}
                       className="hover:underline cursor-pointer flex items-center gap-1"
                     >
                       <i className="fa-solid fa-lightbulb"></i>
                       Helpful ({sol.helpful || 0})
                     </button>
                     <button 
                       onClick={() => {
                         // TODO: Implement solution reply
                         alert('Solution reply coming soon');
                       }}
                       className="hover:underline cursor-pointer"
                     >
                       Reply
                     </button>
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
        </div>
      )}
    </div>
  );
};

export default PostCard;
