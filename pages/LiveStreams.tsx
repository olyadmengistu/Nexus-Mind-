import React, { useState, useEffect } from 'react';
import { User, LiveStream } from '../types';
import LiveStream from '../components/LiveStream';

interface LiveStreamsProps {
  user: User;
}

const LiveStreams: React.FC<LiveStreamsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'my_streams' | 'schedule'>('browse');
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  
  // Create stream form state
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'Gaming',
    tags: '',
    thumbnailFile: null as File | null,
    isPrivate: false,
    allowChat: true,
    maxViewers: ''
  });
  
  // Schedule stream form state
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    category: 'Gaming',
    tags: '',
    scheduledTime: '',
    thumbnailFile: null as File | null,
    isPrivate: false,
    allowChat: true,
    maxViewers: ''
  });

  useEffect(() => {
    // Load sample streams
    const sampleStreams: LiveStream[] = [
      {
        id: '1',
        streamerId: 'user1',
        streamerName: 'John Doe',
        streamerAvatar: 'https://picsum.photos/seed/johndoe/100/100',
        title: 'Live Gaming Session',
        description: 'Join me for an exciting gaming session!',
        thumbnail: 'https://picsum.photos/seed/stream1/320/180',
        streamUrl: '',
        streamKey: '',
        category: 'Gaming',
        tags: ['gaming', 'live', 'entertainment'],
        viewers: 1234,
        likes: 89,
        status: 'live',
        startedAt: Date.now() - 3600000,
        isRecording: false,
        allowChat: true,
        isPrivate: false,
        timestamp: Date.now()
      },
      {
        id: '2',
        streamerId: 'user2',
        streamerName: 'Jane Smith',
        streamerAvatar: 'https://picsum.photos/seed/janesmith/100/100',
        title: 'Music Production Tutorial',
        description: 'Learn music production techniques live',
        thumbnail: 'https://picsum.photos/seed/stream2/320/180',
        streamUrl: '',
        streamKey: '',
        category: 'Music',
        tags: ['music', 'tutorial', 'education'],
        viewers: 567,
        likes: 45,
        status: 'live',
        startedAt: Date.now() - 1800000,
        isRecording: true,
        allowChat: true,
        isPrivate: false,
        timestamp: Date.now()
      },
      {
        id: '3',
        streamerId: 'user3',
        streamerName: 'Mike Johnson',
        streamerAvatar: 'https://picsum.photos/seed/mikejohnson/100/100',
        title: 'Q&A Session',
        description: 'Ask me anything about tech and development',
        thumbnail: 'https://picsum.photos/seed/stream3/320/180',
        streamUrl: '',
        streamKey: '',
        category: 'Technology',
        tags: ['qa', 'tech', 'development'],
        viewers: 89,
        likes: 12,
        status: 'scheduled',
        scheduledTime: Date.now() + 3600000,
        isRecording: false,
        allowChat: true,
        isPrivate: false,
        timestamp: Date.now()
      }
    ];

    setStreams(sampleStreams);
    
    // Load from localStorage if available
    try {
      const storedStreams = localStorage.getItem('nexus_livestreams');
      if (storedStreams) setStreams(JSON.parse(storedStreams));
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Persist streams to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_livestreams', JSON.stringify(streams));
  }, [streams]);

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.title) {
      alert('Please enter a stream title');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Generate stream key for backend
      const streamKey = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newStream: LiveStream = {
        id: Date.now().toString(),
        streamerId: user.id,
        streamerName: user.name,
        streamerAvatar: user.avatar,
        title: createForm.title,
        description: createForm.description,
        thumbnail: createForm.thumbnailFile ? URL.createObjectURL(createForm.thumbnailFile) : 'https://picsum.photos/seed/newstream/320/180',
        streamUrl: '', // Will be set by backend
        streamKey: streamKey,
        category: createForm.category,
        tags: createForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        viewers: 0,
        likes: 0,
        status: 'live',
        startedAt: Date.now(),
        isRecording: false,
        allowChat: createForm.allowChat,
        isPrivate: createForm.isPrivate,
        maxViewers: createForm.maxViewers ? parseInt(createForm.maxViewers) : undefined,
        timestamp: Date.now()
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to streams
      setStreams([newStream, ...streams]);
      
      // Prepare for backend: send stream creation data
      console.log('Backend: Create stream payload', {
        ...newStream,
        thumbnailFile: createForm.thumbnailFile,
        createdBy: user.id
      });
      
      // Reset form
      setCreateForm({
        title: '',
        description: '',
        category: 'Gaming',
        tags: '',
        thumbnailFile: null,
        isPrivate: false,
        allowChat: true,
        maxViewers: ''
      });
      setShowCreateModal(false);
      
      // Select the new stream
      setSelectedStream(newStream);
      
      alert('Stream created successfully!');
    } catch (error) {
      console.error('Error creating stream:', error);
      alert('Error creating stream. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleScheduleStream = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduleForm.title || !scheduleForm.scheduledTime) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsScheduling(true);
    
    try {
      const newStream: LiveStream = {
        id: Date.now().toString(),
        streamerId: user.id,
        streamerName: user.name,
        streamerAvatar: user.avatar,
        title: scheduleForm.title,
        description: scheduleForm.description,
        thumbnail: scheduleForm.thumbnailFile ? URL.createObjectURL(scheduleForm.thumbnailFile) : 'https://picsum.photos/seed/scheduled/320/180',
        streamUrl: '',
        streamKey: '',
        category: scheduleForm.category,
        tags: scheduleForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        viewers: 0,
        likes: 0,
        status: 'scheduled',
        scheduledTime: new Date(scheduleForm.scheduledTime).getTime(),
        isRecording: false,
        allowChat: scheduleForm.allowChat,
        isPrivate: scheduleForm.isPrivate,
        maxViewers: scheduleForm.maxViewers ? parseInt(scheduleForm.maxViewers) : undefined,
        timestamp: Date.now()
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to streams
      setStreams([newStream, ...streams]);
      
      // Prepare for backend: send scheduled stream data
      console.log('Backend: Schedule stream payload', {
        ...newStream,
        thumbnailFile: scheduleForm.thumbnailFile,
        scheduledBy: user.id
      });
      
      // Reset form
      setScheduleForm({
        title: '',
        description: '',
        category: 'Gaming',
        tags: '',
        scheduledTime: '',
        thumbnailFile: null,
        isPrivate: false,
        allowChat: true,
        maxViewers: ''
      });
      setShowScheduleModal(false);
      
      alert('Stream scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling stream:', error);
      alert('Error scheduling stream. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleStartScheduledStream = (streamId: string) => {
    setStreams(streams.map(s => 
      s.id === streamId 
        ? { 
            ...s, 
            status: 'live' as const, 
            startedAt: Date.now(),
            streamKey: `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          } 
        : s
    ));
    
    // Prepare for backend: send start stream
    console.log('Backend: Start scheduled stream payload', {
      streamId,
      userId: user.id,
      timestamp: Date.now()
    });
  };

  const handleDeleteStream = (streamId: string) => {
    if (confirm('Are you sure you want to delete this stream?')) {
      setStreams(streams.filter(s => s.id !== streamId));
      
      // Prepare for backend: send delete stream
      console.log('Backend: Delete stream payload', {
        streamId,
        userId: user.id,
        timestamp: Date.now()
      });
    }
  };

  const handleLikeStream = (streamId: string) => {
    setStreams(streams.map(s => 
      s.id === streamId ? { ...s, likes: s.likes + 1 } : s
    ));
    
    // Prepare for backend: send like stream
    console.log('Backend: Like stream payload', {
      streamId,
      userId: user.id,
      timestamp: Date.now()
    });
  };

  const handleEndStream = () => {
    if (selectedStream) {
      setStreams(streams.map(s => 
        s.id === selectedStream.id 
          ? { 
              ...s, 
              status: 'offline' as const, 
              endedAt: Date.now(),
              duration: selectedStream.startedAt ? Math.floor((Date.now() - selectedStream.startedAt) / 1000) : 0
            } 
          : s
      ));
      setSelectedStream(null);
    }
  };

  // Filter streams based on tab
  const filteredStreams = streams.filter(stream => {
    if (activeTab === 'my_streams') {
      return stream.streamerId === user.id;
    }
    if (activeTab === 'schedule') {
      return stream.status === 'scheduled';
    }
    return true;
  });

  // Get unique categories
  const categories = ['All', 'Gaming', 'Music', 'Technology', 'Education', 'Lifestyle', 'Sports', 'Art'];

  if (selectedStream) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <button
          onClick={() => setSelectedStream(null)}
          className="mb-4 text-gray-600 hover:text-gray-800"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>Back to Streams
        </button>
        <LiveStream
          user={user}
          stream={selectedStream}
          isStreamer={selectedStream.streamerId === user.id}
          onEndStream={handleEndStream}
          onLikeStream={() => handleLikeStream(selectedStream.id)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Live Streams</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <i className="fa-solid fa-video mr-2"></i>Go Live
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fa-solid fa-calendar mr-2"></i>Schedule Stream
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'browse' 
              ? 'text-red-600 border-b-2 border-red-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fa-solid fa-globe mr-2"></i>Browse
        </button>
        <button
          onClick={() => setActiveTab('my_streams')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'my_streams' 
              ? 'text-red-600 border-b-2 border-red-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fa-solid fa-user mr-2"></i>My Streams
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'schedule' 
              ? 'text-red-600 border-b-2 border-red-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fa-solid fa-clock mr-2"></i>Scheduled
        </button>
      </div>

      {/* Streams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStreams.length > 0 ? filteredStreams.map(stream => (
          <div
            key={stream.id}
            className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => stream.status === 'live' || stream.streamerId === user.id ? setSelectedStream(stream) : null}
          >
            <div className="aspect-video bg-gray-200 relative">
              <img src={stream.thumbnail} className="w-full h-full object-cover" alt="" />
              <div className="absolute top-2 left-2 flex gap-2">
                {stream.status === 'live' && (
                  <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </div>
                )}
                {stream.status === 'scheduled' && (
                  <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    SCHEDULED
                  </div>
                )}
                {stream.isRecording && (
                  <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    REC
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                <i className="fa-solid fa-eye mr-1"></i>{stream.viewers}
              </div>
              {stream.isPrivate && (
                <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  <i className="fa-solid fa-lock"></i>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-2">{stream.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <img src={stream.streamerAvatar} className="w-6 h-6 rounded-full" alt="" />
                <span className="text-sm text-gray-600">{stream.streamerName}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                <span><i className="fa-solid fa-heart mr-1"></i>{stream.likes}</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">{stream.category}</span>
              </div>
              {stream.status === 'scheduled' && stream.scheduledTime && (
                <p className="text-sm text-gray-500">
                  <i className="fa-solid fa-calendar mr-1"></i>
                  {new Date(stream.scheduledTime).toLocaleString()}
                </p>
              )}
              {stream.streamerId === user.id && stream.status === 'scheduled' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartScheduledStream(stream.id);
                  }}
                  className="mt-2 w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Start Now
                </button>
              )}
              {stream.streamerId === user.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStream(stream.id);
                  }}
                  className="mt-2 w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <i className="fa-solid fa-video text-4xl mb-4"></i>
            <p>No streams found. Create your first stream!</p>
          </div>
        )}
      </div>

      {/* Create Stream Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Go Live</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleCreateStream} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Stream title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Stream description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={createForm.tags}
                  onChange={(e) => setCreateForm({...createForm, tags: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="gaming, live, entertainment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCreateForm({...createForm, thumbnailFile: e.target.files?.[0] || null})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Viewers (optional)</label>
                <input
                  type="number"
                  value={createForm.maxViewers}
                  onChange={(e) => setCreateForm({...createForm, maxViewers: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createForm.isPrivate}
                    onChange={(e) => setCreateForm({...createForm, isPrivate: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Private Stream</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createForm.allowChat}
                    onChange={(e) => setCreateForm({...createForm, allowChat: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Allow Chat</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Go Live'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Stream Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Schedule Stream</h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleScheduleStream} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({...scheduleForm, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Stream title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({...scheduleForm, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Stream description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={scheduleForm.category}
                  onChange={(e) => setScheduleForm({...scheduleForm, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={scheduleForm.tags}
                  onChange={(e) => setScheduleForm({...scheduleForm, tags: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="gaming, live, entertainment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scheduled Time *</label>
                <input
                  type="datetime-local"
                  value={scheduleForm.scheduledTime}
                  onChange={(e) => setScheduleForm({...scheduleForm, scheduledTime: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScheduleForm({...scheduleForm, thumbnailFile: e.target.files?.[0] || null})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Viewers (optional)</label>
                <input
                  type="number"
                  value={scheduleForm.maxViewers}
                  onChange={(e) => setScheduleForm({...scheduleForm, maxViewers: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={scheduleForm.isPrivate}
                    onChange={(e) => setScheduleForm({...scheduleForm, isPrivate: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Private Stream</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={scheduleForm.allowChat}
                    onChange={(e) => setScheduleForm({...scheduleForm, allowChat: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Allow Chat</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={isScheduling}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isScheduling ? 'Scheduling...' : 'Schedule Stream'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStreams;
