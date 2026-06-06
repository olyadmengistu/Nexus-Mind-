import React, { useState } from 'react';
import { User, DailyReflection } from '../types';

interface ReflectionComposerProps {
  user: User;
  onSubmit: (reflection: DailyReflection) => void;
  onClose: () => void;
}

const MOOD_TAGS = [
  { emoji: '😊', label: 'Happy', color: 'bg-green-100 text-green-800' },
  { emoji: '🤔', label: 'Thoughtful', color: 'bg-blue-100 text-blue-800' },
  { emoji: '😌', label: 'Peaceful', color: 'bg-purple-100 text-purple-800' },
  { emoji: '💪', label: 'Motivated', color: 'bg-orange-100 text-orange-800' },
  { emoji: '🙏', label: 'Grateful', color: 'bg-pink-100 text-pink-800' },
  { emoji: '🌟', label: 'Inspired', color: 'bg-yellow-100 text-yellow-800' },
  { emoji: '😴', label: 'Tired', color: 'bg-gray-100 text-gray-800' },
  { emoji: '🎯', label: 'Focused', color: 'bg-red-100 text-red-800' },
];

const ReflectionComposer: React.FC<ReflectionComposerProps> = ({ user, onSubmit, onClose }) => {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tagLabel: string) => {
    setSelectedTags(prev =>
      prev.includes(tagLabel)
        ? prev.filter(t => t !== tagLabel)
        : [...prev, tagLabel]
    );
  };

  const handleSubmit = () => {
    if (!content.trim()) return;

    const newReflection: DailyReflection = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: content.trim(),
      imageUrl: imagePreview || undefined,
      tags: selectedTags,
      timestamp: Date.now(),
      likes: 0,
    };

    onSubmit(newReflection);
    setContent('');
    setImageFile(null);
    setImagePreview('');
    setSelectedTags([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Share Your Daily Reflection</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full"
          >
            <i className="fa-solid fa-xmark text-gray-600"></i>
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="User" />
            <div className="flex-1">
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">Daily Reflection</p>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind today? Share your personal insights..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#1877F2] min-h-[120px]"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 text-right mt-1">{content.length}/500</p>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add an image (optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg mx-auto"
                  />
                ) : (
                  <div>
                    <i className="fa-solid fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                    <p className="text-sm text-gray-600">Click to upload an image</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </label>
              {imagePreview && (
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling? (Select tags)
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => toggleTag(tag.label)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag.label)
                      ? tag.color + ' ring-2 ring-offset-1 ring-current'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag.emoji} {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="px-6 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Share Reflection
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReflectionComposer;
