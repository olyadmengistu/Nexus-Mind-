
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import StoryCarousel from './StoryCarousel';
import PostCard from './PostCard';
import ComposerModal from './ComposerModal';
import SuggestedCreators from './SuggestedCreators';
import { User, Post } from '../types';
import { getRecommendedPosts } from '../lib/recommendations';

interface FeedProps {
  user: User;
  posts: Post[];
  onAddPost: (post: Post) => void;
  onVote: (postId: string, delta: number) => void;
  onStoryViewerOpen?: (isOpen: boolean) => void;
}

const Feed: React.FC<FeedProps> = ({ user, posts, onAddPost, onVote, onStoryViewerOpen }) => {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>(posts);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // Get user interests from localStorage or user object
    const userInterests = user.interests || JSON.parse(localStorage.getItem('nexus_user_interests') || '[]');
    
    // Apply recommendations if user has interests
    if (userInterests.length > 0) {
      const recommended = getRecommendedPosts(posts, userInterests);
      setDisplayedPosts(recommended);
    } else {
      setDisplayedPosts(posts);
    }
  }, [posts, user.interests]);

  useEffect(() => {
    // Load all users from localStorage for recommendations
    const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
    setAllUsers(users);
  }, []);

  return (
    <div className="flex justify-center min-h-screen">
      <LeftSidebar user={user} />

      <div className="w-full max-w-[680px] px-0 py-2 space-y-3 sm:px-4 sm:py-4 sm:space-y-4 lg:ml-[280px] xl:mr-[300px]">
        {/* Stories */}
        <StoryCarousel user={user} onStoryViewerOpen={onStoryViewerOpen} />

        {/* Mobile Horizontal Scroll - Trending & Contacts */}
        <div className="xl:hidden bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-gray-500 font-bold text-sm sm:text-base mb-3 sm:mb-4">Trending Solutions</h3>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-hide">
            <div className="flex-shrink-0 w-56 sm:w-64 bg-gray-50 rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <i className="fa-solid fa-lightbulb text-white text-sm sm:text-base"></i>
                </div>
                <span className="text-sm sm:text-base font-bold text-gray-700">Top</span>
              </div>
              <p className="text-sm sm:text-base text-gray-600 line-clamp-2">Sustainable energy solution...</p>
              <p className="text-sm sm:text-base text-blue-600 mt-2 sm:mt-3">125</p>
            </div>
            <div className="flex-shrink-0 w-56 sm:w-64 bg-gray-50 rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <i className="fa-solid fa-lightbulb text-white text-sm sm:text-base"></i>
                </div>
                <span className="text-sm sm:text-base font-bold text-gray-700">Rising</span>
              </div>
              <p className="text-sm sm:text-base text-gray-600 line-clamp-2">AI problem solving...</p>
              <p className="text-sm sm:text-base text-blue-600 mt-2 sm:mt-3">98</p>
            </div>
            <div className="flex-shrink-0 w-56 sm:w-64 bg-gray-50 rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500 flex items-center justify-center">
                  <i className="fa-solid fa-lightbulb text-white text-sm sm:text-base"></i>
                </div>
                <span className="text-sm sm:text-base font-bold text-gray-700">Pick</span>
              </div>
              <p className="text-sm sm:text-base text-gray-600 line-clamp-2">Workspace optimization...</p>
              <p className="text-sm sm:text-base text-blue-600 mt-2 sm:mt-3">87</p>
            </div>
          </div>
          
          <h3 className="text-gray-500 font-bold text-sm sm:text-base mb-3 sm:mb-4 mt-4 sm:mt-6">Online Contacts</h3>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-hide">
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative">
                <img src="https://picsum.photos/seed/sarah/50/50" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover" alt="Sarah" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-sm sm:text-base mt-2 text-gray-700 font-medium">Sarah</span>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative">
                <img src="https://picsum.photos/seed/alex/50/50" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover" alt="Alex" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-sm sm:text-base mt-2 text-gray-700 font-medium">Alex</span>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative">
                <img src="https://picsum.photos/seed/maria/50/50" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover" alt="Maria" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-sm sm:text-base mt-2 text-gray-700 font-medium">Maria</span>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative">
                <img src="https://picsum.photos/seed/john/50/50" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover" alt="John" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-400 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-sm sm:text-base mt-2 text-gray-700 font-medium">John</span>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative">
                <img src="https://picsum.photos/seed/tom/50/50" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover" alt="Tom" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-400 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-sm sm:text-base mt-2 text-gray-700 font-medium">Tom</span>
            </div>
          </div>
        </div>

        {/* Composer Trigger */}
        <div className="bg-white sm:rounded-xl shadow-sm p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img src={user.avatar} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" alt="User" />
            <button
              onClick={() => setIsComposerOpen(true)}
              className="flex-1 bg-[#F0F2F5] hover:bg-gray-200 text-left px-4 sm:px-5 py-3 sm:py-3.5 rounded-full text-gray-500 text-sm sm:text-sm sm:text-base transition-colors truncate"
            >
              What problem you are facing?
            </button>
          </div>
          <div className="border-t border-gray-100 pt-3 sm:pt-4 flex items-center justify-around">
            <Link to="/livestreams" className="flex items-center gap-1.5 sm:gap-3 hover:bg-gray-100 flex-1 justify-center py-2.5 sm:py-3 rounded-xl text-[#65676B] font-bold text-[11px] sm:text-xs sm:text-base">
              <i className="fa-solid fa-video text-[#F3425E] text-base sm:text-lg sm:text-xl"></i> 
              <span className="hidden sm:inline">Live</span>
              <span className="sm:hidden">Live</span>
            </Link>
            <button onClick={() => setIsComposerOpen(true)} className="flex items-center gap-1.5 sm:gap-3 hover:bg-gray-100 flex-1 justify-center py-2.5 sm:py-3 rounded-xl text-[#65676B] font-bold text-[11px] sm:text-xs sm:text-base">
              <i className="fa-solid fa-images text-[#45BD62] text-base sm:text-lg sm:text-xl"></i> 
              <span className="hidden sm:inline">Photo</span>
              <span className="sm:hidden">Photo</span>
            </button>
            <button onClick={() => setIsComposerOpen(true)} className="hidden sm:flex items-center gap-2 sm:gap-3 hover:bg-gray-100 flex-1 justify-center py-3 rounded-xl text-[#65676B] font-bold text-xs sm:text-base">
              <i className="fa-regular fa-face-smile text-[#F7B928] text-xl"></i> Feeling
            </button>
          </div>
        </div>

        {/* Suggested Creators */}
        <SuggestedCreators currentUser={user} allUsers={allUsers} />

        {/* Posts */}
        <div className="space-y-4">
          {displayedPosts.map(post => (
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
