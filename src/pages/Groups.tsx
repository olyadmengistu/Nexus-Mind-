import React, { useState, useEffect, useCallback } from 'react';
import { User, Group, GroupPost, GroupComment } from '../types';
import { searchGroups, debounce } from '../lib/searchApi';
import { groupsApi } from '../lib/backendApi';

interface GroupsProps {
  user: User;
}

const Groups: React.FC<GroupsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups' | 'create'>('discover');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  const categories = ['All', 'Technology', 'Business', 'Education', 'Health', 'Entertainment', 'Sports', 'Arts'];

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const data = await groupsApi.getGroups();
        setGroups(data as Group[]);
      } catch (error) {
        console.error('Error loading groups from backend:', error);
        setGroups([]);
      }
    };
    loadGroups();
  }, []);

  // Debounced search function for groups
  const debouncedGroupSearch = useCallback(
    debounce(async (query: string, category: string) => {
      if (query.trim() || category !== 'All') {
        setIsSearching(true);
        try {
          const response = await searchGroups({ 
            query, 
            category: category === 'All' ? undefined : category,
            limit: 50
          });
          setFilteredGroups(response.data);
        } catch (error) {
          console.error('Group search error:', error);
          setFilteredGroups([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setFilteredGroups(groups);
      }
    }, 300),
    [groups]
  );

  // Trigger search when search parameters change
  useEffect(() => {
    debouncedGroupSearch(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, debouncedGroupSearch]);

  // Initialize filteredGroups with all groups on mount
  useEffect(() => {
    setFilteredGroups(groups);
  }, [groups]);

  const handleJoinGroup = async (groupId: string) => {
    try {
      await groupsApi.joinGroup(groupId, user.id);
      setGroups(groups.map(g => 
        g.id === groupId 
          ? { ...g, members: [...g.members, user], memberCount: g.memberCount + 1 }
          : g
      ));
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleCreatePost = () => {
    if (!selectedGroup || !newPostContent.trim()) return;

    const newPost: GroupPost = {
      id: `post${Date.now()}`,
      groupId: selectedGroup.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: newPostContent,
      timestamp: Date.now(),
      likes: 0,
      comments: []
    };

    setSelectedGroup({
      ...selectedGroup,
      posts: [newPost, ...selectedGroup.posts]
    });
    setNewPostContent('');
  };

  const handleLikePost = (postId: string) => {
    if (!selectedGroup) return;
    setSelectedGroup({
      ...selectedGroup,
      posts: selectedGroup.posts.map(p => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      )
    });
  };

  const handleAddComment = (postId: string) => {
    if (!selectedGroup || !newComment[postId]?.trim()) return;

    const comment: GroupComment = {
      id: `comment${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: newComment[postId],
      timestamp: Date.now()
    };

    setSelectedGroup({
      ...selectedGroup,
      posts: selectedGroup.posts.map(p => 
        p.id === postId 
          ? { ...p, comments: [...p.comments, comment] }
          : p
      )
    });
    setNewComment({ ...newComment, [postId]: '' });
  };

  const isMember = (group: Group) => group.members.some(m => m.id === user.id);

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
        >
          <i className="fa-solid fa-plus mr-2"></i>Create Group
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('discover'); setSelectedGroup(null); }}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'discover' ? 'text-[#1877F2]' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fa-solid fa-compass mr-2"></i>Discover
          {activeTab === 'discover' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2]"></span>}
        </button>
        <button
          onClick={() => { setActiveTab('my-groups'); setSelectedGroup(null); }}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'my-groups' ? 'text-[#1877F2]' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fa-solid fa-users mr-2"></i>My Groups
          {activeTab === 'my-groups' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2]"></span>}
        </button>
      </div>

      {/* Group Detail View */}
      {selectedGroup ? (
        <div>
          {/* Group Header */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              <img src={selectedGroup.coverImage} className="w-full h-full object-cover opacity-50" alt="" />
              <button
                onClick={() => setSelectedGroup(null)}
                className="absolute top-4 left-4 px-3 py-1 bg-white bg-opacity-90 rounded-lg hover:bg-opacity-100"
              >
                <i className="fa-solid fa-arrow-left mr-2"></i>Back
              </button>
            </div>
            <div className="p-4 sm:p-6 relative">
              <div className="flex items-start gap-4">
                <img src={selectedGroup.avatar} className="w-20 h-20 rounded-lg border-4 border-white -mt-10 relative z-10" alt="" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{selectedGroup.name}</h2>
                  <p className="text-gray-600">{selectedGroup.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span><i className="fa-solid fa-users mr-1"></i>{selectedGroup.memberCount} members</span>
                    <span><i className="fa-solid fa-tag mr-1"></i>{selectedGroup.category}</span>
                    {selectedGroup.isPrivate && <span><i className="fa-solid fa-lock mr-1"></i>Private</span>}
                  </div>
                </div>
                {isMember(selectedGroup) ? (
                  <button
                    onClick={() => handleLeaveGroup(selectedGroup.id)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <i className="fa-solid fa-right-from-bracket mr-2"></i>Leave Group
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinGroup(selectedGroup.id)}
                    className="px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5]"
                  >
                    <i className="fa-solid fa-user-plus mr-2"></i>Join Group
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Create Post */}
          {isMember(selectedGroup) && (
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex gap-3">
                <img src={user.avatar} className="w-10 h-10 rounded-full" alt="" />
                <div className="flex-1">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Write something to the group..."
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleCreatePost}
                      className="px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5]"
                    >
                      <i className="fa-solid fa-paper-plane mr-2"></i>Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Group Posts */}
          <div className="space-y-4">
            {selectedGroup.posts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex gap-3 mb-3">
                  <img src={post.userAvatar} className="w-10 h-10 rounded-full" alt="" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{post.userName}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(post.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{post.content}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-3 border-t">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#1877F2]"
                  >
                    <i className="fa-solid fa-heart"></i>
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-[#1877F2]">
                    <i className="fa-solid fa-comment"></i>
                    <span>{post.comments.length}</span>
                  </button>
                </div>
                {/* Comments */}
                {post.comments.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {post.comments.map(comment => (
                      <div key={comment.id} className="flex gap-3 pl-4">
                        <img src={comment.userAvatar} className="w-8 h-8 rounded-full" alt="" />
                        <div className="flex-1 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{comment.userName}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Add Comment */}
                {isMember(selectedGroup) && (
                  <div className="mt-4 flex gap-3">
                    <img src={user.avatar} className="w-8 h-8 rounded-full" alt="" />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                        placeholder="Write a comment..."
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3 py-2 bg-[#1877F2] text-white rounded-lg text-sm"
                      >
                        <i className="fa-solid fa-paper-plane"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Group List View */
        <div>
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
              />
              {isSearching && (
                <i className="fa-solid fa-spinner fa-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#1877F2] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {isSearching ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <i className="fa-solid fa-spinner fa-spin text-4xl mb-4"></i>
                <p>Searching groups...</p>
              </div>
            ) : filteredGroups.length > 0 ? filteredGroups.map(group => (
              <div
                key={group.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedGroup(group)}
              >
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  <img src={group.coverImage} className="w-full h-full object-cover opacity-50" alt="" />
                  <div className="absolute bottom-4 left-4">
                    <img src={group.avatar} className="w-16 h-16 rounded-lg border-2 border-white" alt="" />
                  </div>
                </div>
                <div className="p-4 pt-8">
                  <h3 className="font-semibold mb-1">{group.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span><i className="fa-solid fa-users mr-1"></i>{group.memberCount}</span>
                    <span><i className="fa-solid fa-tag mr-1"></i>{group.category}</span>
                  </div>
                  {group.isPrivate && (
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-100 rounded text-xs">
                      <i className="fa-solid fa-lock mr-1"></i>Private
                    </span>
                  )}
                  {isMember(group) && (
                    <span className="inline-block mt-2 ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      <i className="fa-solid fa-check mr-1"></i>Joined
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <i className="fa-solid fa-search text-4xl mb-4"></i>
                <p>No groups found. Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-3 sm:mx-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Group</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Group Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Group name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full px-3 py-2 border rounded-lg" rows={3} placeholder="Describe your group" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Technology</option>
                  <option>Business</option>
                  <option>Education</option>
                  <option>Health</option>
                  <option>Entertainment</option>
                  <option>Sports</option>
                  <option>Arts</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="private" className="rounded" />
                <label htmlFor="private" className="text-sm">Make group private</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Group Avatar</label>
                <input type="file" accept="image/*" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-full px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
              >
                <i className="fa-solid fa-plus mr-2"></i>Create Group
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
