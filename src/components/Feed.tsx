
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import StoryCarousel from './StoryCarousel';
import PostCard from './PostCard';
import ComposerModal from './ComposerModal';
import { User, Post } from '../types';

interface FeedProps {
  user: User;
  posts: Post[];
  onAddPost: (post: Post) => void;
  onVote: (postId: string, delta: number) => void;
}

const Feed: React.FC<FeedProps> = ({ user, posts, onAddPost, onVote }) => {
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  return (
    <div className="flex justify-center min-h-screen">
      <LeftSidebar user={user} />

      <div className="w-full max-w-[680px] px-4 py-4 space-y-4 lg:ml-[280px] lg:mr-[300px]">
        {/* Stories */}
        <StoryCarousel user={user} />

        {/* Composer Trigger */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div className="flex items-center gap-3">
            <img src={user.avatar} className="w-12 h-12 rounded-full" alt="User" />
            <button
              onClick={() => setIsComposerOpen(true)}
              className="flex-1 bg-[#F0F2F5] hover:bg-gray-200 text-left px-5 py-3 rounded-full text-gray-500 text-lg transition-colors"
            >
              What problem are you facing, {user.name}?
            </button>
          </div>
          <div className="border-t border-gray-100 pt-4 flex items-center justify-around">
            <Link to="/livestreams" className="flex items-center gap-3 hover:bg-gray-100 flex-1 justify-center py-3 rounded-xl text-[#65676B] font-bold text-base">
              <i className="fa-solid fa-video text-[#F3425E] text-xl"></i> Live Video
            </Link>
            <button onClick={() => setIsComposerOpen(true)} className="flex items-center gap-3 hover:bg-gray-100 flex-1 justify-center py-3 rounded-xl text-[#65676B] font-bold text-base">
              <i className="fa-solid fa-images text-[#45BD62] text-xl"></i> Photo/video
            </button>
            <button onClick={() => setIsComposerOpen(true)} className="flex items-center gap-3 hover:bg-gray-100 flex-1 justify-center py-3 rounded-xl text-[#65676B] font-bold text-base">
              <i className="fa-regular fa-face-smile text-[#F7B928] text-xl"></i> Feeling/activity
            </button>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onVote={onVote} currentUser={user} />
          ))}
        </div>
      </div>

      <RightSidebar />

      {/* Modal */}
      {isComposerOpen && (
        <ComposerModal 
          user={user} 
          onClose={() => setIsComposerOpen(false)} 
          onSubmit={onAddPost}
        />
      )}
    </div>
  );
};

export default Feed;
