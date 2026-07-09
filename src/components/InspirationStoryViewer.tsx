import React, { useState, useEffect, useRef } from 'react';
import { Inspiration, User } from '../types';

interface InspirationStoryViewerProps {
  inspirations: Inspiration[];
  initialIndex: number;
  currentUser: User;
  onClose: () => void;
  onLike: (inspirationId: string, change: number) => void;
}

const InspirationStoryViewer: React.FC<InspirationStoryViewerProps> = ({
  inspirations,
  initialIndex,
  currentUser,
  onClose,
  onLike
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Record<string, Array<{id: string; userId: string; userName: string; userAvatar: string; text: string; timestamp: number}>>>({});
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const currentInspiration = inspirations[currentIndex];

  // Load liked and saved state from localStorage
  useEffect(() => {
    try {
      const storedLiked = localStorage.getItem('nexus_inspiration_likes');
      const storedSaved = localStorage.getItem('nexus_inspiration_saved');
      const storedComments = localStorage.getItem('nexus_inspiration_comments');
      
      if (storedLiked) setLiked(new Set(JSON.parse(storedLiked)));
      if (storedSaved) setSaved(new Set(JSON.parse(storedSaved)));
      if (storedComments) setComments(JSON.parse(storedComments));
    } catch (error) {
      console.error('Error loading inspiration state:', error);
    }
  }, []);

  const currentInspirationComments = currentInspiration ? comments[currentInspiration.id] || [] : [];

  const pauseAutoAdvance = () => {
    if (autoAdvanceEnabled) {
      setAutoAdvanceEnabled(false);
    }
  };

  // Auto-progress timer
  useEffect(() => {
    setProgress(0);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    if (!autoAdvanceEnabled) {
      return;
    }

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < inspirations.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 1;
      });
    }, 50); // Update every 50ms for smooth progress

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex, inspirations.length, onClose, autoAdvanceEnabled]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentIndex < inspirations.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, inspirations.length, onClose]);

  const handleNext = () => {
    pauseAutoAdvance();
    if (currentIndex < inspirations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    pauseAutoAdvance();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

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

  const handleLike = () => {
    const newLiked = new Set(liked);
    const inspirationId = currentInspiration.id;
    const wasLiked = newLiked.has(inspirationId);
    
    if (wasLiked) {
      newLiked.delete(inspirationId);
    } else {
      newLiked.add(inspirationId);
    }
    
    setLiked(newLiked);
    localStorage.setItem('nexus_inspiration_likes', JSON.stringify([...newLiked]));
    onLike(inspirationId, wasLiked ? -1 : 1);
  };

  const handleSave = () => {
    const newSaved = new Set(saved);
    const inspirationId = currentInspiration.id;
    
    if (newSaved.has(inspirationId)) {
      newSaved.delete(inspirationId);
    } else {
      newSaved.add(inspirationId);
    }
    
    setSaved(newSaved);
    localStorage.setItem('nexus_inspiration_saved', JSON.stringify([...newSaved]));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inspiration from NexusMind',
          text: currentInspiration.content,
          url: window.location.href
        });
      } catch (error) {
        // Share cancelled or failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(currentInspiration.content);
      alert('Inspiration copied to clipboard!');
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: commentText.trim(),
      timestamp: Date.now()
    };

    const updatedComments = {
      ...comments,
      [currentInspiration.id]: [...(comments[currentInspiration.id] || []), newComment]
    };

    setComments(updatedComments);
    localStorage.setItem('nexus_inspiration_comments', JSON.stringify(updatedComments));
    setCommentText('');
  };

  if (!currentInspiration) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <i className="fa-solid fa-xmark text-xl"></i>
      </button>

      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-16 z-50 flex gap-1">
        {inspirations.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-50"
              style={{
                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Story Content */}
      <div
        ref={containerRef}
        className="relative w-full max-w-[420px] h-[90vh] bg-black overflow-hidden"
        onMouseEnter={pauseAutoAdvance}
        onTouchStart={pauseAutoAdvance}
        onClick={pauseAutoAdvance}
      >
        {/* Image */}
        <img
          src={currentInspiration.imageUrl}
          alt="Inspiration"
          className="w-full h-full object-cover"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

        {/* Navigation Arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          aria-label="Previous inspiration"
        >
          <i className="fa-solid fa-chevron-left text-lg"></i>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          aria-label="Next inspiration"
        >
          <i className="fa-solid fa-chevron-right text-lg"></i>
        </button>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-30 flex items-center gap-3">
          <img
            src={currentInspiration.userAvatar}
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
            alt="User"
          />
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{currentInspiration.userName}</p>
            <p className="text-white/70 text-xs">{formatTimestamp(currentInspiration.timestamp)}</p>
          </div>
        </div>

        {/* Challenge Badge */}
        <div className="absolute top-24 left-4 z-30">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2">
            <i className="fa-solid fa-trophy text-yellow-400 text-sm"></i>
            <span className="text-white text-xs font-medium">{currentInspiration.challengeOvercome}</span>
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-24 left-4 right-4 z-30">
          <p className="text-white text-base leading-relaxed drop-shadow-lg">
            {currentInspiration.content}
          </p>
        </div>

        {/* Actions */}
        <div className="absolute bottom-8 left-4 right-4 z-50 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              className={`flex items-center gap-2 transition-colors ${
                liked.has(currentInspiration.id) ? 'text-pink-500' : 'text-white hover:text-pink-400'
              }`}
              aria-label={liked.has(currentInspiration.id) ? 'Unlike inspiration' : 'Like inspiration'}
            >
              <i className={`${liked.has(currentInspiration.id) ? 'fa-solid' : 'fa-regular'} fa-heart text-2xl`}></i>
              <span className="text-sm font-medium">{currentInspiration.likes + (liked.has(currentInspiration.id) ? 1 : 0)}</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
              className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
              aria-label="Open comments"
            >
              <i className="fa-solid fa-comment text-2xl"></i>
              <span className="text-sm font-medium">{currentInspirationComments.length}</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              className="flex items-center gap-2 text-white hover:text-green-400 transition-colors"
              aria-label="Share inspiration"
            >
              <i className="fa-solid fa-share text-2xl"></i>
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleSave(); }}
            className={`transition-colors ${saved.has(currentInspiration.id) ? 'text-yellow-400' : 'text-white hover:text-yellow-400'}`}
            aria-label={saved.has(currentInspiration.id) ? 'Remove saved inspiration' : 'Save inspiration'}
          >
            <i className={`${saved.has(currentInspiration.id) ? 'fa-solid' : 'fa-regular'} fa-bookmark text-2xl`}></i>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div
            className="absolute bottom-20 left-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-xl p-4 max-h-[300px] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="space-y-3 mb-3">
              {currentInspirationComments.length === 0 ? (
                <p className="text-white/70 text-sm text-center">No comments yet. Be the first to comment!</p>
              ) : (
                currentInspirationComments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <img src={comment.userAvatar} className="w-8 h-8 rounded-full object-cover" alt="User" />
                    <div className="flex-1 bg-white/10 rounded-lg p-2">
                      <p className="text-white text-xs font-semibold">{comment.userName}</p>
                      <p className="text-white/90 text-sm">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-white/20 text-white placeholder-white/50 px-3 py-2 rounded-full text-sm outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={(e) => { e.stopPropagation(); handleAddComment(); }}
                disabled={!commentText.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-full text-sm transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        )}

        {/* Navigation Areas */}
        <div
          className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer"
          onClick={handlePrevious}
        />
        <div
          className="absolute inset-y-0 right-0 z-10 w-1/3 cursor-pointer"
          onClick={handleNext}
        />
      </div>
    </div>
  );
};

export default InspirationStoryViewer;
