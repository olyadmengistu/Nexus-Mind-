
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Post, SavedItem } from '../types';
import PostCard from '../components/PostCard';

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
    if (userId) {
      // Look up user from localStorage
      const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
      const foundUser = users.find((u: User) => u.id === userId);
      if (foundUser) {
        console.log('Profile - Found user from localStorage with avatar:', foundUser.avatar);
        setProfileUser(foundUser);
        setEditDetails({
          education: foundUser.education || '',
          location: foundUser.location || '',
          work: foundUser.work || '',
          expertise: foundUser.expertise?.join(', ') || ''
        });
        setEditProfile({
          name: foundUser.name,
          username: foundUser.username,
          bio: foundUser.bio || ''
        });
        setCoverPhotoUrl(foundUser.coverPhoto || '');
      } else {
        // If not found in localStorage, use current user (for own profile)
        console.log('Profile - Using current user with avatar:', user.avatar);
        setProfileUser(user);
        setEditDetails({
          education: user.education || '',
          location: user.location || '',
          work: user.work || '',
          expertise: user.expertise?.join(', ') || ''
        });
        setEditProfile({
          name: user.name,
          username: user.username,
          bio: user.bio || ''
        });
        setCoverPhotoUrl(user.coverPhoto || '');
      }
    } else {
      console.log('Profile - No userId provided, using current user with avatar:', user.avatar);
      setProfileUser(user);
      setEditDetails({
        education: user.education || '',
        location: user.location || '',
        work: user.work || '',
        expertise: user.expertise?.join(', ') || ''
      });
      setEditProfile({
        name: user.name,
        username: user.username,
        bio: user.bio || ''
      });
      setCoverPhotoUrl(user.coverPhoto || '');
    }

    // Load saved items from localStorage
    const savedItemsKey = `nexus_saved_items_${userId || user.id}`;
    const storedSavedItems = localStorage.getItem(savedItemsKey);
    if (storedSavedItems) {
      setSavedItems(JSON.parse(storedSavedItems));
    }
  }, [userId, user]);

  if (!profileUser) {
    return <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">Loading...</div>;
  }

  const myPosts = posts.filter(p => p.userId === profileUser.id);

  const handleRemoveSavedItem = (itemId: string) => {
    const updatedSavedItems = savedItems.filter(item => item.id !== itemId);
    setSavedItems(updatedSavedItems);
    const savedItemsKey = `nexus_saved_items_${userId || user.id}`;
    localStorage.setItem(savedItemsKey, JSON.stringify(updatedSavedItems));
  };

  const handleSaveDetails = () => {
    if (!profileUser) return;

    const updatedUser = {
      ...profileUser,
      education: editDetails.education,
      location: editDetails.location,
      work: editDetails.work,
      expertise: editDetails.expertise.split(',').map(s => s.trim()).filter(s => s)
    };

    setProfileUser(updatedUser);

    // Update in localStorage
    const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('nexus_users', JSON.stringify(users));
    }

    // Update current user in localStorage if it's the same user
    const currentUserData = localStorage.getItem('nexus_current_user');
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);
      if (currentUser.id === updatedUser.id) {
        localStorage.setItem('nexus_current_user', JSON.stringify(updatedUser));
      }
    }

    setShowEditDetails(false);
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleEditCover = () => {
    setShowEditCover(true);
  };

  const handleSaveProfile = () => {
    if (!profileUser) return;

    const updatedUser = {
      ...profileUser,
      name: editProfile.name,
      username: editProfile.username,
      bio: editProfile.bio
    };

    setProfileUser(updatedUser);

    // Update in localStorage
    const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('nexus_users', JSON.stringify(users));
    }

    // Update current user in localStorage if it's the same user
    const currentUserData = localStorage.getItem('nexus_current_user');
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);
      if (currentUser.id === updatedUser.id) {
        localStorage.setItem('nexus_current_user', JSON.stringify(updatedUser));
      }
    }

    setShowEditProfile(false);
  };

  const handleSaveCoverPhoto = () => {
    if (!profileUser) return;

    const updatedUser = {
      ...profileUser,
      coverPhoto: coverPhotoUrl
    };

    setProfileUser(updatedUser);

    // Update in localStorage
    const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('nexus_users', JSON.stringify(users));
    }

    // Update current user in localStorage if it's the same user
    const currentUserData = localStorage.getItem('nexus_current_user');
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);
      if (currentUser.id === updatedUser.id) {
        localStorage.setItem('nexus_current_user', JSON.stringify(updatedUser));
      }
    }

    setShowEditCover(false);
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

  const handleEditPost = (postId: string) => {
    // Edit post - backend ready
    console.log('Editing post:', postId);
    // In a real backend, this would open an edit modal or navigate to edit page
  };

  return (
    <div className="bg-[#F0F2F5] min-h-screen">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-[1100px] mx-auto">
          {/* Cover */}
          <div
            className="h-[350px] rounded-b-xl relative group"
            style={{
              backgroundImage: profileUser.coverPhoto
                ? `url(${profileUser.coverPhoto})`
                : 'linear-gradient(to bottom, #d1d5db, #6b7280)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
             <button onClick={handleEditCover} className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg font-bold text-sm shadow flex items-center gap-2">
                <i className="fa-solid fa-camera"></i> Edit cover photo
             </button>
          </div>
          
          {/* Profile Info Row */}
          <div className="px-10 pb-4 relative">
             <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-10 md:-mt-20">
                <div className="relative group">
                  <img src={profileUser.avatar} className="w-[168px] h-[168px] rounded-full border-4 border-white shadow" alt="Avatar" />
                  <button className="absolute bottom-4 right-2 bg-gray-200 hover:bg-gray-300 w-9 h-9 rounded-full border-4 border-white flex items-center justify-center">
                    <i className="fa-solid fa-camera"></i>
                  </button>
                </div>
                <div className="flex-1 mb-4 text-center md:text-left">
                  <h1 className="text-4xl font-bold">{profileUser.name}</h1>
                  <p className="text-gray-500 font-semibold">{profileUser.reputation} Reputation Points</p>
                  <p className="text-gray-600 mt-2">{profileUser.bio}</p>
                </div>
                <div className="flex gap-2 mb-4">
                  <button className="bg-[#1877F2] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                    <i className="fa-solid fa-bookmark"></i> Saved
                  </button>
                  <button onClick={handleEditProfile} className="bg-gray-200 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                    <i className="fa-solid fa-pen"></i> Edit profile
                  </button>
                </div>
             </div>
             
             {/* Tabs */}
             <div className="mt-8 flex border-t border-gray-200 pt-1">
                {['Challenges', 'About', 'Expertise', 'Solutions', 'Saved', 'More'].map((tab, idx) => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-4 py-4 font-bold text-gray-600 border-b-4 ${activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent hover:bg-gray-100'}`}
                   >
                     {tab}
                   </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-[1100px] mx-auto px-4 py-4 flex flex-col lg:flex-row gap-4">
        {/* Left Side (Intro/Photos) */}
        <div className="w-full lg:w-[400px] space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
             <h2 className="text-xl font-bold mb-4">Intro</h2>
             <div className="space-y-4 text-sm text-gray-700">
                <p className="text-center italic">{profileUser.bio || 'No bio added yet'}</p>
                {profileUser.work && (
                  <div className="flex items-center gap-3">
                     <i className="fa-solid fa-briefcase text-gray-500 text-lg"></i>
                     <span>Works at <b>{profileUser.work}</b></span>
                  </div>
                )}
                {profileUser.education && (
                  <div className="flex items-center gap-3">
                     <i className="fa-solid fa-graduation-cap text-gray-500 text-lg"></i>
                     <span>Went to <b>{profileUser.education}</b></span>
                  </div>
                )}
                {profileUser.location && (
                  <div className="flex items-center gap-3">
                     <i className="fa-solid fa-location-dot text-gray-500 text-lg"></i>
                     <span>From <b>{profileUser.location}</b></span>
                  </div>
                )}
                {profileUser.expertise && profileUser.expertise.length > 0 && (
                  <div className="flex items-start gap-3">
                     <i className="fa-solid fa-star text-gray-500 text-lg mt-0.5"></i>
                     <div>
                       <span className="font-bold">Expertise:</span>
                       <div className="flex flex-wrap gap-1 mt-1">
                         {profileUser.expertise.map((skill, idx) => (
                           <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">{skill}</span>
                         ))}
                       </div>
                     </div>
                  </div>
                )}
                <button onClick={() => setShowEditDetails(true)} className="w-full bg-gray-200 hover:bg-gray-300 font-bold py-2 rounded-lg transition-colors">Edit Details</button>
             </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold">Saved</h2>
               <button className="text-blue-500 hover:bg-blue-50 p-2 rounded text-sm font-semibold">See all saved</button>
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
        <div className="flex-1 space-y-4">
          {activeTab === 'Challenges' && (
            <>
              <div className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between">
                <h2 className="font-bold text-xl">Challenges Posted</h2>
                <div className="flex gap-2">
                  <button onClick={() => setShowFilters(true)} className="bg-gray-200 px-3 py-1.5 rounded font-bold text-sm flex items-center gap-2">
                     <i className="fa-solid fa-sliders"></i> Filters
                  </button>
                  <button onClick={() => setShowManagePosts(true)} className="bg-gray-200 px-3 py-1.5 rounded font-bold text-sm flex items-center gap-2">
                     <i className="fa-solid fa-gear"></i> Manage Posts
                  </button>
                </div>
              </div>

              {myPosts.length > 0 ? (
                myPosts.map(post => (
                  <PostCard key={post.id} post={post} currentUser={profileUser} onVote={() => {}} />
                ))
              ) : (
                <div className="bg-white p-10 text-center rounded-lg shadow-sm text-gray-500 italic">
                  No problems posted yet.
                </div>
              )}
            </>
          )}

          {activeTab === 'About' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-bold text-xl mb-4">About</h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">{profileUser.bio || 'No bio added yet.'}</p>
                <div className="border-t pt-4">
                  <h3 className="font-bold mb-2">Contact Information</h3>
                  <p><strong>Email:</strong> {profileUser.email}</p>
                  <p><strong>Username:</strong> @{profileUser.username}</p>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-bold mb-2">Statistics</h3>
                  <p><strong>Reputation Points:</strong> {profileUser.reputation}</p>
                  <p><strong>Posts:</strong> {myPosts.length}</p>
                  <p><strong>Saved Items:</strong> {savedItems.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Expertise' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-bold text-xl mb-4">Expertise</h2>
              {profileUser.expertise && profileUser.expertise.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileUser.expertise.map((skill, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No expertise added yet. Click "Edit Details" to add your skills.</p>
              )}
            </div>
          )}

          {activeTab === 'Solutions' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-bold text-xl mb-4">Solutions</h2>
              <div className="text-gray-500 italic">
                Solutions posted by {profileUser.name} will appear here.
              </div>
            </div>
          )}

          {activeTab === 'Saved' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-bold text-xl mb-4">Saved Items</h2>
              {savedItems.length > 0 ? (
                <div className="space-y-4">
                  {savedItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 flex items-center gap-4">
                      {item.thumbnail && (
                        <img src={item.thumbnail} className="w-16 h-16 rounded object-cover" alt={item.title} />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.itemType}</p>
                        {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                      </div>
                      <button
                        onClick={() => handleRemoveSavedItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No saved items yet.</p>
              )}
            </div>
          )}

          {activeTab === 'More' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-bold text-xl mb-4">More</h2>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3">
                  <i className="fa-solid fa-users text-gray-500"></i>
                  <span>Friends</span>
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3">
                  <i className="fa-solid fa-images text-gray-500"></i>
                  <span>Photos</span>
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3">
                  <i className="fa-solid fa-video text-gray-500"></i>
                  <span>Videos</span>
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3">
                  <i className="fa-solid fa-heart text-gray-500"></i>
                  <span>Liked Posts</span>
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3">
                  <i className="fa-solid fa-clock-rotate-left text-gray-500"></i>
                  <span>Activity Log</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Details Modal */}
      {showEditDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
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
