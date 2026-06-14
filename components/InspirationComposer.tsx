import React, { useState } from 'react';
import { User, Inspiration } from '../types';

interface InspirationComposerProps {
  user: User;
  onSubmit: (inspiration: Inspiration) => void;
  onClose: () => void;
}

const InspirationComposer: React.FC<InspirationComposerProps> = ({ user, onSubmit, onClose }) => {
  const [content, setContent] = useState('');
  const [challengeOvercome, setChallengeOvercome] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

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

  const handleSubmit = () => {
    if (!content.trim() || !challengeOvercome.trim() || !imagePreview) return;

    const newInspiration: Inspiration = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: content.trim(),
      imageUrl: imagePreview,
      challengeOvercome: challengeOvercome.trim(),
      timestamp: Date.now(),
      likes: 0,
    };

    onSubmit(newInspiration);
    setContent('');
    setChallengeOvercome('');
    setImageFile(null);
    setImagePreview('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Share Your Inspiration</h2>
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
              <p className="text-xs text-gray-500">Inspire Hub</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What challenge did you overcome? *
            </label>
            <input
              type="text"
              value={challengeOvercome}
              onChange={(e) => setChallengeOvercome(e.target.value)}
              placeholder="e.g., Overcoming imposter syndrome, Career transition, Building confidence..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 text-right mt-1">{challengeOvercome.length}/100</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share your inspirational testimony *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell your story of how you overcame this challenge and inspire others..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#1877F2] min-h-[120px]"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right mt-1">{content.length}/500</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload a photo * <span className="text-gray-400">(Required)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                required
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
                    <i className="fa-solid fa-camera text-4xl text-gray-400 mb-2"></i>
                    <p className="text-sm text-gray-600">Click to upload a photo</p>
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
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <i className="fa-solid fa-lightbulb mr-2"></i>
              <strong>Tip:</strong> Your story can inspire someone facing similar challenges. Be authentic and share what helped you succeed.
            </p>
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
            disabled={!content.trim() || !challengeOvercome.trim() || !imagePreview}
            className="px-6 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Share Inspiration
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspirationComposer;
