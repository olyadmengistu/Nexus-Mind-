
import React, { useState, useRef } from 'react';
import { User, Post } from '../types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

interface ComposerModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (post: Post) => void;
}

const ComposerModal: React.FC<ComposerModalProps> = ({ user, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [privacy, setPrivacy] = useState('Public');
  const [imageUrl, setImageUrl] = useState('');
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);
  const [emoji, setEmoji] = useState('');
  const [location, setLocation] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['General', 'Technology', 'Business', 'Creative', 'Personal', 'Science', 'Social'];

  const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '✨', '🎉', '💯', '🙏', '💪', '🤝', '👏', '🙌'];

  const locations = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Paris, France', 'Berlin, Germany', 'Sydney, Australia', 'Toronto, Canada', 'Dubai, UAE', 'Singapore', 'Mumbai, India'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      title,
      content,
      category,
      timestamp: Date.now(),
      votes: 0,
      solutions: [],
      isSolved: false,
      imageUrl: imageUrl || undefined,
      taggedUsers: taggedUsers.length > 0 ? taggedUsers : undefined,
      emoji: emoji || undefined,
      location: location || undefined
    };

    onSubmit(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[500px] rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="w-8"></div>
          <h2 className="text-xl font-bold">Create Problem Post</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 flex items-center gap-3">
          <img src={user.avatar} className="w-10 h-10 rounded-full" alt="Avatar" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">{user.name}</h4>
            <div className="flex gap-2">
              <div className="bg-gray-200 px-2 py-0.5 rounded flex items-center gap-1 text-[11px] font-bold cursor-pointer">
                <i className="fa-solid fa-users text-xs"></i> {privacy} <i className="fa-solid fa-caret-down"></i>
              </div>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-gray-200 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer outline-none"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="p-4 flex-1 space-y-3">
          <input 
            type="text" 
            placeholder="Problem Title (optional)" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-lg font-semibold focus:outline-none placeholder-gray-400"
          />
          <textarea 
            placeholder={`What problem are you facing, ${user.name.split(' ')[0]}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[150px] text-xl focus:outline-none resize-none placeholder-gray-400"
          ></textarea>
          
          {/* Image Preview */}
          {imageUrl && (
            <div className="relative">
              <img src={imageUrl} alt="Preview" className="w-full max-h-[300px] object-cover rounded-lg" />
              <button 
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          {/* Emoji Display */}
          {emoji && (
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg w-fit">
              <span className="text-2xl">{emoji}</span>
              <button 
                onClick={() => setEmoji('')}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          {/* Location Display */}
          {location && (
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg w-fit">
              <i className="fa-solid fa-location-dot text-[#F3425E]"></i>
              <span className="text-sm">{location}</span>
              <button 
                onClick={() => setLocation('')}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          {/* Tagged Users Display */}
          {taggedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {taggedUsers.map((tag, index) => (
                <div key={index} className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
                  <span className="text-sm text-blue-700">@{tag}</span>
                  <button 
                    onClick={() => setTaggedUsers(taggedUsers.filter((_, i) => i !== index))}
                    className="text-blue-500 hover:text-blue-700 text-xs"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add to Post */}
        <div className="mx-4 mb-4 p-3 border border-gray-300 rounded-lg flex items-center justify-between">
          <span className="font-semibold text-sm">Add to your post</span>
          <div className="flex gap-3 text-2xl">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <i 
              className="fa-solid fa-images text-[#45BD62] cursor-pointer hover:opacity-80"
              onClick={() => fileInputRef.current?.click()}
            ></i>
            <i 
              className="fa-solid fa-user-tag text-[#1877F2] cursor-pointer hover:opacity-80"
              onClick={() => setShowTagPicker(!showTagPicker)}
            ></i>
            <i 
              className="fa-regular fa-face-smile text-[#F7B928] cursor-pointer hover:opacity-80"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            ></i>
            <i 
              className="fa-solid fa-location-dot text-[#F3425E] cursor-pointer hover:opacity-80"
              onClick={() => setShowLocationPicker(!showLocationPicker)}
            ></i>
            <i 
              className="fa-solid fa-ellipsis text-gray-400 cursor-pointer hover:opacity-80"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
            ></i>
          </div>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mx-4 mb-4 p-3 border border-gray-300 rounded-lg bg-white">
            <div className="grid grid-cols-5 gap-2">
              {emojis.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    setEmoji(e);
                    setShowEmojiPicker(false);
                  }}
                  className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Location Picker */}
        {showLocationPicker && (
          <div className="mx-4 mb-4 p-3 border border-gray-300 rounded-lg bg-white">
            <input
              type="text"
              placeholder="Search location..."
              className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <div className="max-h-[150px] overflow-y-auto space-y-1">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setLocation(loc);
                    setShowLocationPicker(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors text-sm"
                >
                  <i className="fa-solid fa-location-dot text-[#F3425E] mr-2"></i>
                  {loc}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tag Picker */}
        {showTagPicker && (
          <div className="mx-4 mb-4 p-3 border border-gray-300 rounded-lg bg-white">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Enter username..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setTaggedUsers([...taggedUsers, e.currentTarget.value.trim()]);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                onClick={() => setShowTagPicker(false)}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
            <p className="text-xs text-gray-500">Type a username and press Enter to tag</p>
          </div>
        )}

        {/* More Options */}
        {showMoreOptions && (
          <div className="mx-4 mb-4 p-3 border border-gray-300 rounded-lg bg-white">
            <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors text-sm flex items-center gap-2">
              <i className="fa-solid fa-gif text-purple-500"></i>
              Add GIF
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors text-sm flex items-center gap-2">
              <i className="fa-solid fa-video text-blue-500"></i>
              Add Video
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors text-sm flex items-center gap-2">
              <i className="fa-solid fa-poll text-green-500"></i>
              Add Poll
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors text-sm flex items-center gap-2">
              <i className="fa-solid fa-calendar text-orange-500"></i>
              Schedule Post
            </button>
          </div>
        )}

        {/* Submit */}
        <div className="p-4">
          <button 
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="w-full bg-[#1877F2] disabled:bg-gray-300 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition-colors"
          >
            Post Challenge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposerModal;
