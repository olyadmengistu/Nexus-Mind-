import React, { useState, useEffect } from 'react';
import { User, Post } from '../types';

interface SavedPostsProps {
  user: User;
}

const SavedPosts: React.FC<SavedPostsProps> = ({ user }) => {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('nexus_saved_posts') || '[]');
    const allPosts = JSON.parse(localStorage.getItem('nexus_posts') || '[]');
    const filteredPosts = allPosts.filter((post: Post) => saved.includes(post.id));
    setSavedPosts(filteredPosts);
  }, []);

  const handleUnsave = (postId: string) => {
    const saved = JSON.parse(localStorage.getItem('nexus_saved_posts') || '[]');
    const updated = saved.filter((id: string) => id !== postId);
    localStorage.setItem('nexus_saved_posts', JSON.stringify(updated));
    setSavedPosts(savedPosts.filter(post => post.id !== postId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        <h1 className="text-3xl font-bold mb-8">Saved Posts</h1>
        
        {savedPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <i className="fa-solid fa-bookmark text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No saved posts yet</h2>
            <p className="text-gray-500">Start saving posts by clicking the bookmark icon on any post.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={post.userAvatar} className="w-10 h-10 rounded-full object-cover" alt="Avatar" />
                    <div>
                      <p className="font-semibold">{post.userName}</p>
                      <p className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnsave(post.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <i className="fa-solid fa-bookmark"></i>
                  </button>
                </div>
                <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                <p className="text-gray-700 mb-4">{post.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-arrow-up"></i> {post.votes}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{post.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPosts;
