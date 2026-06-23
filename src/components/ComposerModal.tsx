
import React, { useState, useRef } from 'react';
import { User, Post, Poll, PollOption } from '../types';
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
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [gifUrl, setGifUrl] = useState('');
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);
  const [emoji, setEmoji] = useState('');
  const [location, setLocation] = useState('');
  const [locationCoordinates, setLocationCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('smileys');
  const [tagSearch, setTagSearch] = useState('');
  const [gifSearch, setGifSearch] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollExpiry, setPollExpiry] = useState<number>(24);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const categories = ['General', 'Technology', 'Business', 'Creative', 'Personal', 'Science', 'Social', 'Health', 'Education', 'Entertainment'];

  const emojiCategories = {
    smileys: ['😀', '', '', '🥰', '', '�', '', '', '�', '�', '❤️', '', '✨', '🎉', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�'],
    people: ['', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜'],
    nature: ['🌸', '�', '�️', '', '🥀', '🌺', '�', '🌼', '�', '�', '�', '�', '�', '�', '�', '�', '�', '☘️', '�', '�', '�', '�'],
    food: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳'],
    objects: ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝']
  };

  const sampleGifs = [
    'https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif',
    'https://media.giphy.com/media/3o7TKoWXm3okO1kgHC/giphy.gif',
    'https://media.giphy.com/media/xT0xeuOy2Fcl9vDGiA/giphy.gif',
    'https://media.giphy.com/media/l46CyJmS8NK4j9CY0/giphy.gif',
    'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif'
  ];

  const allEmojis = Object.values(emojiCategories).flat();

  const filteredEmojis = emojiSearch 
    ? allEmojis.filter(e => e.includes(emojiSearch))
    : emojiCategories[selectedEmojiCategory as keyof typeof emojiCategories];

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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `videos/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setVideoUrl(url);
    } catch (error) {
      console.error('Error uploading video:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationCoordinates({ latitude, longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const locationName = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setLocation(locationName);
          setShowLocationPicker(false);
        } catch (error) {
          console.error('Error getting location name:', error);
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setShowLocationPicker(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location. Please enable location services.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    ).finally(() => {
      setGettingLocation(false);
    });
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleUpdatePollOption = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    let poll: Poll | undefined;
    if (showPollCreator && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2) {
      poll = {
        question: pollQuestion,
        options: pollOptions
          .filter(o => o.trim())
          .map((text, idx) => ({
            id: `opt_${idx}`,
            text,
            votes: 0
          })),
        expiresAt: pollExpiry ? Date.now() + pollExpiry * 60 * 60 * 1000 : undefined
      };
    }

    let scheduledTime: number | undefined;
    if (showSchedulePicker && scheduledDate && scheduledTime) {
      scheduledTime = new Date(`${scheduledDate}T${scheduledTime}`).getTime();
    }

    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      title,
      content,
      category,
      timestamp: scheduledTime || Date.now(),
      votes: 0,
      solutions: [],
      isSolved: false,
      imageUrl: imageUrl || undefined,
      videoUrl: videoUrl || undefined,
      gifUrl: gifUrl || undefined,
      taggedUsers: taggedUsers.length > 0 ? taggedUsers : undefined,
      emoji: emoji || undefined,
      location: location || undefined,
      locationCoordinates: locationCoordinates || undefined,
      poll,
      scheduledTime,
      privacy
    };

    onSubmit(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[500px] rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
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
        <div className="p-4 flex items-center gap-3 shrink-0">
          <img src={user.avatar} className="w-10 h-10 rounded-full" alt="Avatar" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">{user.name}</h4>
            <div className="flex gap-2">
              <select 
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="bg-gray-200 px-2 py-0.5 rounded flex items-center gap-1 text-[11px] font-bold cursor-pointer outline-none"
              >
                <option value="public">🌐 Public</option>
                <option value="friends">👥 Friends</option>
                <option value="private">🔒 Private</option>
              </select>
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
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
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

          {/* Video Preview */}
          {videoUrl && (
            <div className="relative">
              <video src={videoUrl} controls className="w-full max-h-[300px] rounded-lg" />
              <button 
                onClick={() => setVideoUrl('')}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          {/* GIF Preview */}
          {gifUrl && (
            <div className="relative">
              <img src={gifUrl} alt="GIF" className="w-full max-h-[300px] object-cover rounded-lg" />
              <button 
                onClick={() => setGifUrl('')}
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

          {/* Poll Preview */}
          {showPollCreator && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <input
                type="text"
                placeholder="Ask a question..."
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              {pollOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleUpdatePollOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      onClick={() => handleRemovePollOption(index)}
                      className="px-2 text-red-500 hover:text-red-700"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 10 && (
                <button
                  onClick={handleAddPollOption}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Option
                </button>
              )}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Poll expires in:</label>
                <select
                  value={pollExpiry}
                  onChange={(e) => setPollExpiry(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={1}>1 hour</option>
                  <option value={6}>6 hours</option>
                  <option value={24}>1 day</option>
                  <option value={72}>3 days</option>
                  <option value={168}>1 week</option>
                </select>
              </div>
            </div>
          )}

          {/* Schedule Preview */}
          {showSchedulePicker && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 block mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-600 block mb-1">Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add to Post */}
        <div className="mx-4 mb-4 p-3 border border-gray-300 rounded-lg flex items-center justify-between shrink-0">
          <span className="font-semibold text-sm">Add to your post</span>
          <div className="flex gap-3 text-2xl">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <input 
              type="file" 
              ref={videoInputRef}
              onChange={handleVideoUpload}
              accept="video/*"
              className="hidden"
            />
            <i 
              className="fa-solid fa-images text-[#45BD62] cursor-pointer hover:opacity-80"
              onClick={() => fileInputRef.current?.click()}
              title="Add Photo/Video"
            ></i>
            <i 
              className="fa-solid fa-video text-[#1877F2] cursor-pointer hover:opacity-80"
              onClick={() => videoInputRef.current?.click()}
              title="Add Video"
            ></i>
            <i 
              className="fa-solid fa-user-tag text-[#1877F2] cursor-pointer hover:opacity-80"
              onClick={() => setShowTagPicker(!showTagPicker)}
              title="Tag People"
            ></i>
            <i 
              className="fa-regular fa-face-smile text-[#F7B928] cursor-pointer hover:opacity-80"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add Emoji"
            ></i>
            <i 
              className="fa-solid fa-location-dot text-[#F3425E] cursor-pointer hover:opacity-80"
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              title="Add Location"
            ></i>
            <i 
              className="fa-solid fa-ellipsis text-gray-400 cursor-pointer hover:opacity-80"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              title="More Options"
            ></i>
          </div>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mx-4 mb-4 p-3 border border-gray-300 rounded-lg bg-white shrink-0">
            <input
              type="text"
              placeholder="Search emojis..."
              value={emojiSearch}
              onChange={(e) => setEmojiSearch(e.target.value)}
              className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {!emojiSearch && (
              <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                {Object.keys(emojiCategories).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedEmojiCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      selectedEmojiCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto">
              {filteredEmojis.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    setEmoji(e);
                    setShowEmojiPicker(false);
                    setEmojiSearch('');
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
          <div className="mx-4 mb-4 p-3 border border-gray-300 rounded-lg bg-white shrink-0">
            <button
              onClick={handleGetCurrentLocation}
              disabled={gettingLocation}
              className="w-full mb-3 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {gettingLocation ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Getting location...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-crosshairs"></i>
                  Use my current location
                </>
              )}
            </button>
            <div className="relative mb-2">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search location..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="max-h-[150px] overflow-y-auto space-y-1">
              {['New York, USA', 'London, UK', 'Tokyo, Japan', 'Paris, France', 'Berlin, Germany', 'Sydney, Australia', 'Toronto, Canada', 'Dubai, UAE', 'Singapore', 'Mumbai, India'].map((loc) => (
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
          <div className="mx-4 mb-4 p-3 border border-gray-300 rounded-lg bg-white shrink-0">
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      setTaggedUsers([...taggedUsers, e.currentTarget.value.trim().replace('@', '')]);
                      setTagSearch('');
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
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

        {/* GIF Picker */}
        {showGifPicker && (
          <div className="mx-4 mb-4 p-3 border border-gray-300 rounded-lg bg-white shrink-0">
            <input
              type="text"
              placeholder="Search GIFs..."
              value={gifSearch}
              onChange={(e) => setGifSearch(e.target.value)}
              className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
              {sampleGifs.map((gif) => (
                <button
                  key={gif}
                  onClick={() => {
                    setGifUrl(gif);
                    setShowGifPicker(false);
                  }}
                  className="rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <img src={gif} alt="GIF" className="w-full h-24 object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* More Options */}
        {showMoreOptions && (
          <div className="mx-4 mb-4 p-3 border border-gray-300 rounded-lg bg-white shrink-0">
            <button 
              onClick={() => {
                setShowGifPicker(!showGifPicker);
                setShowMoreOptions(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors text-sm flex items-center gap-2"
            >
              <i className="fa-solid fa-gif text-purple-500"></i>
              Add GIF
            </button>
            <button 
              onClick={() => {
                setShowPollCreator(!showPollCreator);
                setShowMoreOptions(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors text-sm flex items-center gap-2"
            >
              <i className="fa-solid fa-poll text-green-500"></i>
              Add Poll
            </button>
            <button 
              onClick={() => {
                setShowSchedulePicker(!showSchedulePicker);
                setShowMoreOptions(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors text-sm flex items-center gap-2"
            >
              <i className="fa-solid fa-calendar text-orange-500"></i>
              Schedule Post
            </button>
          </div>
        )}

        {/* Submit */}
        <div className="p-4 shrink-0">
          <button 
            onClick={handleSubmit}
            disabled={!content.trim() || uploading}
            className="w-full bg-[#1877F2] disabled:bg-gray-300 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition-colors"
          >
            {uploading ? 'Uploading...' : 'Post Challenge'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposerModal;
