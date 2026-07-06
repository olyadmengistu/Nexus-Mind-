
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Post, SavedItem } from '../types';
import PostCard from '../components/PostCard';
import StreakBadge from '../components/StreakBadge';
import BadgeGrid from '../components/BadgeGrid';
import ExpertiseGraph from '../components/ExpertiseGraph';
import { userApi, savedItemsApi, streakApi, badgesApi, expertiseApi } from '../lib/firebaseApi';
import { userApi as firebaseUserApi } from '../lib/firebaseApi';

interface ProfileProps {
  user: User;
  posts: Post[];
}

const Profile: React.FC<ProfileProps> = ({ user, posts }) => {
  const { userId } = useParams<{ userId: string }>();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [activeTab, setActiveTab] = useState('Challenges');
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditCover, setShowEditCover] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showManagePosts, setShowManagePosts] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [streakData, setStreakData] = useState<{ streak: number; longestStreak: number; streakFreezes: number }>({ streak: 0, longestStreak: 0, streakFreezes: 0 });
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editDetails, setEditDetails] = useState({
    education: '',
    location: '',
    work: '',
    expertise: ''
  });
  const [editProfile, setEditProfile] = useState({
    name: '',
    username: '',
    bio: ''
  });
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'newest',
    dateRange: ''
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const targetUserId = userId || user.id;
        const profileData = await userApi.getUser(targetUserId);
        setProfileUser(profileData);
        setEditDetails({
          education: profileData.education || '',
          location: profileData.location || '',
          work: profileData.work || '',
          expertise: profileData.expertise?.join(', ') || ''
        });
        setEditProfile({
          name: profileData.name,
          username: profileData.username,
          bio: profileData.bio || ''
        });
        setCoverPhotoUrl(profileData.coverPhoto || '');
        
        // Load streak data
        setStreakData({
          streak: profileData.streak || 0,
          longestStreak: profileData.longestStreak || 0,
          streakFreezes: profileData.streakFreezes || 0
        });

        // Check if current user is following this profile
        if (userId && userId !== user.id) {
          const followingList = JSON.parse(localStorage.getItem('nexus_following') || '[]');
          setIsFollowing(followingList.includes(userId));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to current user
        setProfileUser(user);
      }
    };

    const loadSavedItems = async () => {
      try {
        const targetUserId = userId || user.id;
        const savedData = await userApi.getSavedItems(targetUserId);
        setSavedItems(savedData);
      } catch (error) {
        console.error('Error loading saved items:', error);
      }
    };

    // Update streak if viewing own profile
    const updateStreak = async () => {
      if (!userId || userId === user.id) {
        try {
          const streakResult = await streakApi.updateStreak(user.id);
          setStreakData({
            streak: streakResult.streak,
            longestStreak: streakResult.longestStreak,
            streakFreezes: streakResult.streakFreezes
          });
          
          // Show celebration if streak increased
          if (streakResult.message === 'Streak increased!' && streakResult.streak > 1) {
            setShowStreakCelebration(true);
          }
        } catch (error) {
          console.error('Error updating streak:', error);
        }
      }
    };

    // Check for new badges if viewing own profile
    const checkBadges = async () => {
      if (!userId || userId === user.id) {
        try {
          const badgeResult = await badgesApi.checkBadges(user.id);
          if (badgeResult.newBadges.length > 0) {
            setNewBadges(badgeResult.newBadges);
            setShowBadgeCelebration(true);
          }
        } catch (error) {
          console.error('Error checking badges:', error);
        }
      }
    };

    loadUserProfile();
    loadSavedItems();
    updateStreak();
    checkBadges();
  }, [userId, user]);

  if (!profileUser) {
    return <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">Loading...</div>;
  }

  const myPosts = posts.filter(p => p.userId === profileUser.id);

  const handleRemoveSavedItem = async (savedId: string) => {
    try {
      await savedItemsApi.removeSavedItem(userId || user.id, savedId);
      const updatedSavedItems = savedItems.filter(item => item.id !== savedId);
      setSavedItems(updatedSavedItems);
    } catch (error) {
      console.error('Error removing saved item:', error);
    }
  };

  const handleSaveDetails = async () => {
    if (!profileUser) return;

    const updatedUser = {
      ...profileUser,
      education: editDetails.education,
      location: editDetails.location,
      work: editDetails.work,
      expertise: editDetails.expertise.split(',').map(s => s.trim()).filter(s => s)
    };

    try {
      await userApi.updateUser(profileUser.id, {
        education: updatedUser.education,
        location: updatedUser.location,
        work: updatedUser.work,
        expertise: updatedUser.expertise,
      });
      setProfileUser(updatedUser);
      setShowEditDetails(false);
    } catch (error) {
      console.error('Error saving profile details:', error);
    }
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleEditCover = () => {
    setShowEditCover(true);
  };

  const handleSaveProfile = async () => {
    if (!profileUser) return;

    const updatedUser = {
      ...profileUser,
      name: editProfile.name,
      username: editProfile.username,
      bio: editProfile.bio
    };

    try {
      await userApi.updateUser(profileUser.id, {
        name: updatedUser.name,
        username: updatedUser.username,
        bio: updatedUser.bio,
      });
      setProfileUser(updatedUser);
      setShowEditProfile(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleSaveCoverPhoto = async () => {
    if (!profileUser) return;

    const updatedUser = {
      ...profileUser,
      coverPhoto: coverPhotoUrl
    };

    try {
      await userApi.updateUser(profileUser.id, {
        coverPhoto: updatedUser.coverPhoto,
      });
      setProfileUser(updatedUser);
      setShowEditCover(false);
    } catch (error) {
      console.error('Error saving cover photo:', error);
    }
  };

  const handleApplyFilters = () => {
    // Apply filters to posts - backend ready
    console.log('Applying filters:', filters);
    setShowFilters(false);
  };

  const handleDeletePost = (postId: string) => {
    // Delete post - backend ready
    console.log('Deleting post:', postId);
    // In a real backend, this would make an API call
  };

  const handleAddStreakFreeze = async () => {
    try {
      const result = await streakApi.addStreakFreeze(user.id);
      setStreakData({
        ...streakData,
        streakFreezes: result.streakFreezes
      });
      alert('Streak freeze added! You can use it to protect your streak if you miss a day.');
    } catch (error) {
      console.error('Error adding streak freeze:', error);
      alert('Failed to add streak freeze. Maximum of 3 freezes allowed.');
    }
  };

  const handleFollow = async () => {
    if (!profileUser || !userId) return;

    try {
      if (isFollowing) {
        // Unfollow
        await firebaseUserApi.unfollowUser(user.id, userId);
        const followingList = JSON.parse(localStorage.getItem('nexus_following') || '[]');
        const updatedList = followingList.filter((id: string) => id !== userId);
        localStorage.setItem('nexus_following', JSON.stringify(updatedList));
        setIsFollowing(false);
      } else {
        // Follow
        await firebaseUserApi.followUser(user.id, userId);
        const followingList = JSON.parse(localStorage.getItem('nexus_following') || '[]');
        if (!followingList.includes(userId)) {
          followingList.push(userId);
          localStorage.setItem('nexus_following', JSON.stringify(followingList));
        }
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Fallback to localStorage only
      const followingList = JSON.parse(localStorage.getItem('nexus_following') || '[]');
      if (isFollowing) {
        const updatedList = followingList.filter((id: string) => id !== userId);
        localStorage.setItem('nexus_following', JSON.stringify(updatedList));
        setIsFollowing(false);
      } else {
        if (!followingList.includes(userId)) {
          followingList.push(userId);
          localStorage.setItem('nexus_following', JSON.stringify(followingList));
        }
        setIsFollowing(true);
      }
    }
  };

  return (
    <div className="bg-[#F0F2F5] min-h-screen">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-[1100px] mx-auto">
          {/* Cover */}
          <div
            className="h-[200px] sm:h-[250px] md:h-[350px] rounded-b-xl relative group"
            style={{
              backgroundImage: profileUser.coverPhoto
                ? `url(${profileUser.coverPhoto})`
                : 'linear-gradient(to bottom, #d1d5db, #6b7280)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
             <button onClick={handleEditCover} className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-bold text-[10px] sm:text-sm shadow flex items-center gap-1.5 sm:gap-2">
                <i className="fa-solid fa-camera text-xs sm:text-sm"></i> <span className="hidden sm:inline">Edit cover</span>
             </button>
          </div>
          
          {/* Profile Info Row */}
          <div className="px-4 sm:px-6 md:px-10 pb-3 sm:pb-4 relative">
             <div className="flex flex-col md:flex-row items-center md:items-end gap-3 sm:gap-4 -mt-8 sm:-mt-10 md:-mt-20">
                <div className="relative group">
                  <img src={profileUser.avatar} className="w-20 h-20 sm:w-28 sm:h-28 sm:w-[168px] sm:h-[168px] rounded-full border-3 sm:border-4 border-white shadow" alt="Avatar" />
                  <button className="absolute bottom-2 sm:bottom-4 right-1 sm:right-2 bg-gray-200 hover:bg-gray-300 w-7 h-7 sm:w-9 sm:h-9 rounded-full border-3 sm:border-4 border-white flex items-center justify-center">
                    <i className="fa-solid fa-camera text-xs sm:text-sm"></i>
                  </button>
                </div>
                <div className="flex-1 mb-3 sm:mb-4 text-center md:text-left">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{profileUser.name}</h1>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 justify-center md:justify-start">
                    <p className="text-gray-500 font-semibold text-xs sm:text-sm">{profileUser.reputation} Rep</p>
                    {streakData.streak > 0 && (
                      <StreakBadge streak={streakData.streak} size="small" />
                    )}
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1.5 sm:mt-2 line-clamp-2">{profileUser.bio}</p>
                </div>
                <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap justify-center">
                  {userId && userId !== user.id && (
                    <button
                      onClick={handleFollow}
                      className={`
                        px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-bold flex items-center gap-1.5 sm:gap-2 transition-colors text-xs sm:text-sm
                        ${isFollowing 
                          ? 'bg-black text-white hover:bg-gray-800' 
                          : 'bg-[#42B72A] text-white hover:bg-[#36a420]'
                        }
                      `}
                    >
                      {isFollowing ? (
                        <>
                          <i className="fa-solid fa-check text-xs sm:text-sm"></i> <span className="hidden sm:inline">Following</span><span className="sm:hidden">Follow</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-user-plus text-xs sm:text-sm"></i> <span className="hidden sm:inline">Follow</span><span className="sm:hidden">Follow</span>
                        </>
                      )}
                    </button>
                  )}
                  <button className="bg-[#1877F2] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <i className="fa-solid fa-bookmark text-xs sm:text-sm"></i> <span className="hidden sm:inline">Saved</span>
                  </button>
                  {!userId || userId === user.id ? (
                    <button onClick={handleEditProfile} className="bg-gray-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <i className="fa-solid fa-pen text-xs sm:text-sm"></i> <span className="hidden sm:inline">Edit</span>
                    </button>
                  ) : (
                    <button className="bg-gray-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <i className="fa-solid fa-message text-xs sm:text-sm"></i> <span className="hidden sm:inline">Message</span>
                    </button>
                  )}
                </div>
             </div>
             
             {/* Tabs */}
             <div className="mt-4 sm:mt-6 md:mt-8 flex border-t border-gray-200 pt-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {['Challenges', 'Badges', 'About', 'Expertise', 'Solutions', 'Saved', 'More'].map((tab, idx) => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-3 sm:px-4 py-2.5 sm:py-4 font-bold text-gray-600 border-b-4 text-xs sm:text-sm whitespace-nowrap ${activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent hover:bg-gray-100'}`}
                   >
                     {tab}
                   </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-[1100px] mx-auto px-2.5 sm:px-4 py-2.5 sm:py-4 flex flex-col lg:flex-row gap-3 sm:gap-4">
        {/* Left Side (Intro/Photos) */}
        <div className="w-full lg:w-[400px] space-y-3 sm:space-y-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
             <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Intro</h2>
             <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-700">
                <p className="text-center italic">{profileUser.bio || 'No bio added yet'}</p>
                
                {/* Streak Section */}
                {streakData.streak > 0 && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-2.5 sm:p-3 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="font-bold text-orange-800 text-xs sm:text-sm">Current Streak</span>
                      <StreakBadge streak={streakData.streak} size="small" showLabel={false} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-600 mb-1.5 sm:mb-2">
                      <span>Longest: {streakData.longestStreak} days</span>
                      <span>Freezes: {streakData.streakFreezes}/3</span>
                    </div>
                    {streakData.streakFreezes < 3 && userId === user.id && (
                      <button 
                        onClick={handleAddStreakFreeze}
                        className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-semibold transition-colors"
                      >
                        + Add Streak Freeze
                      </button>
                    )}
                  </div>
                )}
                
                {profileUser.work && (
                  <div className="flex items-center gap-2 sm:gap-3">
                     <i className="fa-solid fa-briefcase text-gray-500 text-sm sm:text-lg"></i>
                     <span className="text-xs sm:text-sm">Works at <b>{profileUser.work}</b></span>
                  </div>
                )}
                {profileUser.education && (
                  <div className="flex items-center gap-2 sm:gap-3">
                     <i className="fa-solid fa-graduation-cap text-gray-500 text-sm sm:text-lg"></i>
                     <span className="text-xs sm:text-sm">Went to <b>{profileUser.education}</b></span>
                  </div>
                )}
                {profileUser.location && (
                  <div className="flex items-center gap-2 sm:gap-3">
                     <i className="fa-solid fa-location-dot text-gray-500 text-sm sm:text-lg"></i>
                     <span className="text-xs sm:text-sm">From <b>{profileUser.location}</b></span>
                  </div>
                )}
                {profileUser.expertise && profileUser.expertise.length > 0 && (
                  <div className="flex items-start gap-2 sm:gap-3">
                     <i className="fa-solid fa-star text-gray-500 text-sm sm:text-lg mt-0.5"></i>
                     <div>
                       <span className="font-bold text-xs sm:text-sm">Expertise:</span>
                       <div className="flex flex-wrap gap-1 mt-1">
                         {profileUser.expertise.map((skill, idx) => (
                           <span key={idx} className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">{skill}</span>
                         ))}
                       </div>
                     </div>
                  </div>
                )}
                <button onClick={() => setShowEditDetails(true)} className="w-full bg-gray-200 hover:bg-gray-300 font-bold py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm">Edit Details</button>
             </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
             <div className="flex items-center justify-between mb-3 sm:mb-4">
               <h2 className="text-lg sm:text-xl font-bold">Saved</h2>
               <button className="text-blue-500 hover:bg-blue-50 p-1.5 sm:p-2 rounded text-[10px] sm:text-sm font-semibold">See all</button>
             </div>
             {savedItems.length > 0 ? (
               <div className="grid grid-cols-3 gap-2">
                  {savedItems.slice(0, 6).map((item, idx) => (
                    <div key={item.id} className="relative group">
                      <img
                        src={item.thumbnail || `https://picsum.photos/seed/s${idx}/200/200`}
                        className="rounded-lg aspect-square object-cover"
                        alt={item.title}
                      />
                      <button
                        onClick={() => handleRemoveSavedItem(item.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
               </div>
             ) : (
               <div className="text-center text-gray-500 py-8">
                 <i className="fa-solid fa-bookmark text-4xl mb-2"></i>
                 <p>No saved items yet</p>
               </div>
             )}
          </div>
        </div>

        {/* Right Side (Posts) */}
        <div className="flex-1 space-y-3 sm:space-y-4">
          {activeTab === 'Challenges' && (
            <>
              <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-sm flex items-center justify-between">
                <h2 className="font-bold text-lg sm:text-xl">Challenges</h2>
                <div className="flex gap-1.5 sm:gap-2">
                  <button onClick={() => setShowFilters(true)} className="bg-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded font-bold text-[10px] sm:text-sm flex items-center gap-1.5 sm:gap-2">
                     <i className="fa-solid fa-sliders text-xs sm:text-sm"></i> <span className="hidden sm:inline">Filters</span>
                  </button>
                  <button onClick={() => setShowManagePosts(true)} className="bg-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded font-bold text-[10px] sm:text-sm flex items-center gap-1.5 sm:gap-2">
                     <i className="fa-solid fa-gear text-xs sm:text-sm"></i> <span className="hidden sm:inline">Manage</span>
                  </button>
                </div>
              </div>

              {myPosts.length > 0 ? (
                myPosts.map(post => (
                  <PostCard key={post.id} post={post} currentUser={profileUser} onVote={() => {}} />
                ))
              ) : (
                <div className="bg-white p-6 sm:p-10 text-center rounded-lg shadow-sm text-gray-500 italic text-xs sm:text-sm">
                  No problems posted yet.
                </div>
              )}
            </>
          )}

          {activeTab === 'About' && (
            <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm">
              <h2 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">About</h2>
              <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                <p className="text-base sm:text-lg">{profileUser.bio || 'No bio added yet.'}</p>
                <div className="border-t pt-3 sm:pt-4">
                  <h3 className="font-bold mb-2 text-sm sm:text-base">Contact Information</h3>
                  <p className="text-xs sm:text-sm"><strong>Email:</strong> {profileUser.email}</p>
                  <p className="text-xs sm:text-sm"><strong>Username:</strong> @{profileUser.username}</p>
                </div>
                <div className="border-t pt-3 sm:pt-4">
                  <h3 className="font-bold mb-2 text-sm sm:text-base">Statistics</h3>
                  <p className="text-xs sm:text-sm"><strong>Reputation Points:</strong> {profileUser.reputation}</p>
                  <p className="text-xs sm:text-sm"><strong>Posts:</strong> {myPosts.length}</p>
                  <p className="text-xs sm:text-sm"><strong>Saved Items:</strong> {savedItems.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Badges' && (
            <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm">
              <h2 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">Achievement Badges</h2>
              <BadgeGrid userId={profileUser.id} showProgress={true} />
            </div>
          )}

          {activeTab === 'Expertise' && (
            <div className="space-y-3 sm:space-y-4">
              <ExpertiseGraph userId={profileUser.id} showUpdateButton={userId === user.id} />
              
              {profileUser.expertise && profileUser.expertise.length > 0 && (
                <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm">
                  <h2 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">Skills & Interests</h2>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {profileUser.expertise.map((skill, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-2 sm:px-4 py-1 sm:py-2 rounded-full font-semibold text-xs sm:text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {(!profileUser.expertise || profileUser.expertise.length === 0) && (
                <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm">
                  <h2 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">Skills & Interests</h2>
                  <p className="text-gray-500 italic text-xs sm:text-sm">No expertise added yet. Click "Edit Details" to add your skills.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Solutions' && (
            <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm">
              <h2 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">Solutions</h2>
              <div className="text-gray-500 italic text-xs sm:text-sm">
                Solutions posted by {profileUser.name} will appear here.
              </div>
            </div>
          )}

          {activeTab === 'Saved' && (
            <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm">
              <h2 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">Saved Items</h2>
              {savedItems.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {savedItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-2.5 sm:p-4 flex items-center gap-2 sm:gap-4">
                      {item.thumbnail && (
                        <img src={item.thumbnail} className="w-12 h-12 sm:w-16 sm:h-16 rounded object-cover" alt={item.title} />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-xs sm:text-sm sm:text-base">{item.title}</h3>
                        <p className="text-[10px] sm:text-sm text-gray-500">{item.itemType}</p>
                        {item.description && <p className="text-[10px] sm:text-sm text-gray-600 line-clamp-2">{item.description}</p>}
                      </div>
                      <button
                        onClick={() => handleRemoveSavedItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 sm:p-2"
                      >
                        <i className="fa-solid fa-trash text-sm sm:text-base"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-xs sm:text-sm">No saved items yet.</p>
              )}
            </div>
          )}

          {activeTab === 'More' && (
            <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm">
              <h2 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">More</h2>
              <div className="space-y-1 sm:space-y-2">
                <button className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 rounded-lg flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                  <i className="fa-solid fa-users text-gray-500 text-sm sm:text-base"></i>
                  <span>Friends</span>
                </button>
                <button className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 rounded-lg flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                  <i className="fa-solid fa-images text-gray-500 text-sm sm:text-base"></i>
                  <span>Photos</span>
                </button>
                <button className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 rounded-lg flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                  <i className="fa-solid fa-video text-gray-500 text-sm sm:text-base"></i>
                  <span>Videos</span>
                </button>
                <button className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 rounded-lg flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                  <i className="fa-solid fa-heart text-gray-500 text-sm sm:text-base"></i>
                  <span>Liked Posts</span>
                </button>
                <button className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 rounded-lg flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                  <i className="fa-solid fa-clock-rotate-left text-gray-500 text-sm sm:text-base"></i>
                  <span>Activity Log</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Streak Celebration Modal */}
      {showStreakCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-md mx-3 sm:mx-4 text-center">
            <div className="text-6xl mb-4">🔥</div>
            <h2 className="text-2xl font-bold mb-2">Streak Continued!</h2>
            <p className="text-gray-600 mb-4">You're on fire! Your streak is now <span className="font-bold text-orange-500">{streakData.streak} days</span>.</p>
            <StreakBadge streak={streakData.streak} size="large" showLabel={false} className="mb-6" />
            <button 
              onClick={() => setShowStreakCelebration(false)}
              className="w-full bg-[#1877F2] text-white py-3 rounded-lg font-bold hover:bg-blue-600"
            >
              Keep it going!
            </button>
          </div>
        </div>
      )}

      {/* Badge Celebration Modal */}
      {showBadgeCelebration && newBadges.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-md mx-3 sm:mx-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">
              {newBadges.length === 1 ? 'New Badge Earned!' : 'New Badges Earned!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {newBadges.length === 1 
                ? `You earned the "${newBadges[0].name}" badge!` 
                : `You earned ${newBadges.length} new badges!`}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {newBadges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-4xl shadow-lg">
                    {badge.icon}
                  </div>
                  <span className="text-sm font-semibold mt-2">{badge.name}</span>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => {
                setShowBadgeCelebration(false);
                setNewBadges([]);
              }}
              className="w-full bg-[#1877F2] text-white py-3 rounded-lg font-bold hover:bg-blue-600"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {showEditDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-3 sm:mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Work</label>
                <input
                  type="text"
                  value={editDetails.work}
                  onChange={(e) => setEditDetails({...editDetails, work: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., Technology Sector"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Education</label>
                <input
                  type="text"
                  value={editDetails.education}
                  onChange={(e) => setEditDetails({...editDetails, education: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., Stanford University"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={editDetails.location}
                  onChange={(e) => setEditDetails({...editDetails, location: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Expertise (comma-separated)</label>
                <input
                  type="text"
                  value={editDetails.expertise}
                  onChange={(e) => setEditDetails({...editDetails, expertise: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., React, TypeScript, Node.js"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleSaveDetails} className="flex-1 bg-[#1877F2] text-white py-2 rounded-lg font-bold">Save</button>
              <button onClick={() => setShowEditDetails(false)} className="flex-1 bg-gray-200 py-2 rounded-lg font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-3 sm:mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Name</label>
                <input
                  type="text"
                  value={editProfile.name}
                  onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Username</label>
                <input
                  type="text"
                  value={editProfile.username}
                  onChange={(e) => setEditProfile({...editProfile, username: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Bio</label>
                <textarea
                  value={editProfile.bio}
                  onChange={(e) => setEditProfile({...editProfile, bio: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleSaveProfile} className="flex-1 bg-[#1877F2] text-white py-2 rounded-lg font-bold">Save</button>
              <button onClick={() => setShowEditProfile(false)} className="flex-1 bg-gray-200 py-2 rounded-lg font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Cover Photo Modal */}
      {showEditCover && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-3 sm:mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Cover Photo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Cover Photo URL</label>
                <input
                  type="text"
                  value={coverPhotoUrl}
                  onChange={(e) => setCoverPhotoUrl(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter image URL"
                />
              </div>
              {coverPhotoUrl && (
                <div>
                  <label className="block text-sm font-semibold mb-1">Preview</label>
                  <img
                    src={coverPhotoUrl}
                    alt="Cover preview"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-1">Or upload a file</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCoverPhotoUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleSaveCoverPhoto} className="flex-1 bg-[#1877F2] text-white py-2 rounded-lg font-bold">Save</button>
              <button onClick={() => setShowEditCover(false)} className="flex-1 bg-gray-200 py-2 rounded-lg font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-3 sm:mx-4">
            <h2 className="text-xl font-bold mb-4">Filter Posts</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">All Categories</option>
                  <option value="technology">Technology</option>
                  <option value="science">Science</option>
                  <option value="math">Mathematics</option>
                  <option value="engineering">Engineering</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most_votes">Most Votes</option>
                  <option value="least_votes">Least Votes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleApplyFilters} className="flex-1 bg-[#1877F2] text-white py-2 rounded-lg font-bold">Apply Filters</button>
              <button onClick={() => setShowFilters(false)} className="flex-1 bg-gray-200 py-2 rounded-lg font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Posts Modal */}
      {showManagePosts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-3 sm:mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Manage Posts</h2>
            {myPosts.length > 0 ? (
              <div className="space-y-3">
                {myPosts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold">{post.title}</h3>
                      <p className="text-sm text-gray-500">{post.category} • {new Date(post.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPost(post.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-8">No posts to manage.</p>
            )}
            <div className="mt-6">
              <button onClick={() => setShowManagePosts(false)} className="w-full bg-gray-200 py-2 rounded-lg font-bold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
