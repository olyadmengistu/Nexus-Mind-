import React, { useState, useEffect } from 'react';
import { User, Video, Meeting } from '../types';

interface VideosProps {
  user: User;
}

const Videos: React.FC<VideosProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'meetings' | 'upload'>('videos');
  const [videos, setVideos] = useState<Video[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  // Video upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'Education',
    tags: '',
    videoFile: null as File | null,
    thumbnailFile: null as File | null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Meeting scheduling form state
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    duration: 60,
    maxParticipants: 50
  });
  const [isScheduling, setIsScheduling] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'views' | 'likes'>('recent');
  
  // Comments state
  const [comments, setComments] = useState<Record<string, Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: number;
  }>>>({});
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    // Load sample videos
    const sampleVideos: Video[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Doe',
        userAvatar: 'https://via.placeholder.com/40',
        title: 'Introduction to Problem Solving',
        description: 'Learn the fundamentals of effective problem solving in this comprehensive guide.',
        thumbnail: 'https://via.placeholder.com/320x180',
        videoUrl: '',
        views: 1250,
        likes: 89,
        duration: '15:30',
        timestamp: Date.now() - 86400000,
        category: 'Education',
        tags: ['problem-solving', 'education', 'tutorial']
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Jane Smith',
        userAvatar: 'https://via.placeholder.com/40',
        title: 'Advanced Collaboration Techniques',
        description: 'Master the art of collaboration with these advanced strategies.',
        thumbnail: 'https://via.placeholder.com/320x180',
        videoUrl: '',
        views: 890,
        likes: 67,
        duration: '22:45',
        timestamp: Date.now() - 172800000,
        category: 'Business',
        tags: ['collaboration', 'business', 'teamwork']
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Mike Johnson',
        userAvatar: 'https://via.placeholder.com/40',
        title: 'Building Successful Partnerships',
        description: 'A guide to creating and maintaining successful business partnerships.',
        thumbnail: 'https://via.placeholder.com/320x180',
        videoUrl: '',
        views: 2100,
        likes: 156,
        duration: '18:20',
        timestamp: Date.now() - 259200000,
        category: 'Business',
        tags: ['partnership', 'business', 'networking']
      }
    ];

    const sampleMeetings: Meeting[] = [
      {
        id: '1',
        hostId: 'user1',
        hostName: 'John Doe',
        hostAvatar: 'https://via.placeholder.com/40',
        title: 'Weekly Problem Solving Session',
        description: 'Join us for our weekly problem solving workshop.',
        scheduledTime: Date.now() + 3600000,
        duration: 60,
        participants: [],
        maxParticipants: 50,
        status: 'scheduled',
        meetingUrl: ''
      },
      {
        id: '2',
        hostId: 'user2',
        hostName: 'Jane Smith',
        hostAvatar: 'https://via.placeholder.com/40',
        title: 'Collaboration Strategies Webinar',
        description: 'Learn effective collaboration strategies for teams.',
        scheduledTime: Date.now() + 86400000,
        duration: 90,
        participants: [],
        maxParticipants: 100,
        status: 'scheduled',
        meetingUrl: ''
      }
    ];

    setVideos(sampleVideos);
    setMeetings(sampleMeetings);
    
    // Load videos from localStorage if available
    try {
      const storedVideos = localStorage.getItem('nexus_videos');
      const storedMeetings = localStorage.getItem('nexus_meetings');
      if (storedVideos) setVideos(JSON.parse(storedVideos));
      if (storedMeetings) setMeetings(JSON.parse(storedMeetings));
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);
  
  // Persist videos and meetings to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_videos', JSON.stringify(videos));
  }, [videos]);
  
  useEffect(() => {
    localStorage.setItem('nexus_meetings', JSON.stringify(meetings));
  }, [meetings]);

  const handleLikeVideo = (videoId: string) => {
    setVideos(videos.map(v => 
      v.id === videoId ? { ...v, likes: v.likes + 1 } : v
    ));
    // Prepare for backend: send like event to API
    const video = videos.find(v => v.id === videoId);
    if (video) {
      console.log('Backend: Like video payload', {
        videoId,
        userId: user.id,
        timestamp: Date.now()
      });
    }
  };
  
  const handleUnlikeVideo = (videoId: string) => {
    setVideos(videos.map(v => 
      v.id === videoId ? { ...v, likes: Math.max(0, v.likes - 1) } : v
    ));
    // Prepare for backend: send unlike event to API
    console.log('Backend: Unlike video payload', {
      videoId,
      userId: user.id,
      timestamp: Date.now()
    });
  };
  
  const handleViewVideo = (videoId: string) => {
    setVideos(videos.map(v => 
      v.id === videoId ? { ...v, views: v.views + 1 } : v
    ));
    // Prepare for backend: send view event to API
    console.log('Backend: View video payload', {
      videoId,
      userId: user.id,
      timestamp: Date.now()
    });
  };

  const handleJoinMeeting = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting && meeting.participants.length >= meeting.maxParticipants) {
      alert('Meeting is full');
      return;
    }
    if (meeting && meeting.participants.some(p => p.id === user.id)) {
      alert('You have already joined this meeting');
      return;
    }
    setMeetings(meetings.map(m => 
      m.id === meetingId 
        ? { ...m, participants: [...m.participants, user] }
        : m
    ));
    // Prepare for backend: send join meeting event to API
    console.log('Backend: Join meeting payload', {
      meetingId,
      userId: user.id,
      timestamp: Date.now()
    });
  };
  
  const handleLeaveMeeting = (meetingId: string) => {
    setMeetings(meetings.map(m => 
      m.id === meetingId 
        ? { ...m, participants: m.participants.filter(p => p.id !== user.id) }
        : m
    ));
    // Prepare for backend: send leave meeting event to API
    console.log('Backend: Leave meeting payload', {
      meetingId,
      userId: user.id,
      timestamp: Date.now()
    });
  };
  
  const handleCancelMeeting = (meetingId: string) => {
    if (confirm('Are you sure you want to cancel this meeting?')) {
      setMeetings(meetings.map(m => 
        m.id === meetingId ? { ...m, status: 'ended' as const } : m
      ));
      // Prepare for backend: send cancel meeting event to API
      console.log('Backend: Cancel meeting payload', {
        meetingId,
        userId: user.id,
        timestamp: Date.now()
      });
    }
  };
  
  const handleDeleteVideo = (videoId: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      setVideos(videos.filter(v => v.id !== videoId));
      if (selectedVideo?.id === videoId) {
        setSelectedVideo(null);
      }
      // Prepare for backend: send delete video event to API
      console.log('Backend: Delete video payload', {
        videoId,
        userId: user.id,
        timestamp: Date.now()
      });
    }
  };

  // Video upload handler
  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.title || !uploadForm.videoFile) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Prepare video data for backend
      const videoData = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        title: uploadForm.title,
        description: uploadForm.description,
        thumbnail: uploadForm.thumbnailFile ? URL.createObjectURL(uploadForm.thumbnailFile) : 'https://via.placeholder.com/320x180',
        videoUrl: uploadForm.videoFile ? URL.createObjectURL(uploadForm.videoFile) : '',
        views: 0,
        likes: 0,
        duration: '0:00', // Will be calculated from actual video file
        timestamp: Date.now(),
        category: uploadForm.category,
        tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Add video to state
      setVideos([videoData, ...videos]);
      
      // Prepare for backend: send video data to API
      console.log('Backend: Upload video payload', {
        ...videoData,
        videoFile: uploadForm.videoFile,
        thumbnailFile: uploadForm.thumbnailFile,
        uploadedBy: user.id
      });
      
      // Reset form
      setUploadForm({
        title: '',
        description: '',
        category: 'Education',
        tags: '',
        videoFile: null,
        thumbnailFile: null
      });
      setUploadProgress(0);
      setShowUploadModal(false);
      
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Meeting scheduling handler
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingForm.title || !meetingForm.scheduledTime) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsScheduling(true);
    
    try {
      // Prepare meeting data for backend
      const meetingData: Meeting = {
        id: Date.now().toString(),
        hostId: user.id,
        hostName: user.name,
        hostAvatar: user.avatar,
        title: meetingForm.title,
        description: meetingForm.description,
        scheduledTime: new Date(meetingForm.scheduledTime).getTime(),
        duration: meetingForm.duration,
        participants: [],
        maxParticipants: meetingForm.maxParticipants,
        status: 'scheduled',
        meetingUrl: '' // Will be generated by backend
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add meeting to state
      setMeetings([meetingData, ...meetings]);
      
      // Prepare for backend: send meeting data to API
      console.log('Backend: Schedule meeting payload', {
        ...meetingData,
        hostedBy: user.id
      });
      
      // Reset form
      setMeetingForm({
        title: '',
        description: '',
        scheduledTime: '',
        duration: 60,
        maxParticipants: 50
      });
      setShowMeetingModal(false);
      
      alert('Meeting scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Error scheduling meeting. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };
  
  // Comments handlers
  const handleAddComment = (videoId: string) => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: newComment,
      timestamp: Date.now()
    };
    
    setComments(prev => ({
      ...prev,
      [videoId]: [...(prev[videoId] || []), comment]
    }));
    
    // Prepare for backend: send comment to API
    console.log('Backend: Add comment payload', {
      videoId,
      ...comment
    });
    
    setNewComment('');
  };
  
  const handleDeleteComment = (videoId: string, commentId: string) => {
    setComments(prev => ({
      ...prev,
      [videoId]: prev[videoId]?.filter(c => c.id !== commentId) || []
    }));
    
    // Prepare for backend: send delete comment to API
    console.log('Backend: Delete comment payload', {
      videoId,
      commentId,
      userId: user.id
    });
  };
  
  // Filter and sort videos
  const filteredVideos = videos
    .filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return b.timestamp - a.timestamp;
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'likes') return b.likes - a.likes;
      return 0;
    });
  
  // Get unique categories
  const categories = ['All', ...Array.from(new Set(videos.map(v => v.category)))];

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Videos & Meetings</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
          >
            <i className="fa-solid fa-upload mr-2"></i>Upload Video
          </button>
          <button
            onClick={() => setShowMeetingModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <i className="fa-solid fa-video mr-2"></i>Schedule Meeting
          </button>
        </div>
      </div>
      
      {/* Search and Filter Bar */}
      {activeTab === 'videos' && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border rounded-lg"
                />
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'views' | 'likes')}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="recent">Most Recent</option>
                <option value="views">Most Viewed</option>
                <option value="likes">Most Liked</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'videos' 
              ? 'text-[#1877F2] border-b-2 border-[#1877F2]' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fa-solid fa-play mr-2"></i>Videos
        </button>
        <button
          onClick={() => setActiveTab('meetings')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'meetings' 
              ? 'text-[#1877F2] border-b-2 border-[#1877F2]' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fa-solid fa-calendar mr-2"></i>Meetings
        </button>
      </div>

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div>
          {selectedVideo ? (
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={() => setSelectedVideo(null)}
                className="mb-4 text-gray-600 hover:text-gray-800"
              >
                <i className="fa-solid fa-arrow-left mr-2"></i>Back to Videos
              </button>
              <div className="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center relative">
                {selectedVideo.videoUrl ? (
                  <video
                    src={selectedVideo.videoUrl}
                    controls
                    className="w-full h-full rounded-lg"
                    onPlay={() => handleViewVideo(selectedVideo.id)}
                  />
                ) : (
                  <div className="text-center">
                    <i className="fa-solid fa-play text-white text-6xl mb-4"></i>
                    <p className="text-white">Video not available</p>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
              <div className="flex items-center gap-4 mb-4 text-gray-600">
                <span><i className="fa-solid fa-eye mr-1"></i>{selectedVideo.views} views</span>
                <span><i className="fa-solid fa-heart mr-1"></i>{selectedVideo.likes} likes</span>
                <span><i className="fa-solid fa-clock mr-1"></i>{selectedVideo.duration}</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <img src={selectedVideo.userAvatar} className="w-10 h-10 rounded-full" alt="" />
                <div>
                  <p className="font-semibold">{selectedVideo.userName}</p>
                  <p className="text-sm text-gray-500">Posted {new Date(selectedVideo.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{selectedVideo.description}</p>
              <div className="flex gap-2">
                {selectedVideo.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleLikeVideo(selectedVideo.id)}
                  className="px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                >
                  <i className="fa-solid fa-heart mr-2"></i>Like
                </button>
                <button
                  onClick={() => handleUnlikeVideo(selectedVideo.id)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <i className="fa-solid fa-heart-broken mr-2"></i>Unlike
                </button>
                {selectedVideo.userId === user.id && (
                  <button
                    onClick={() => handleDeleteVideo(selectedVideo.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <i className="fa-solid fa-trash mr-2"></i>Delete
                  </button>
                )}
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <i className="fa-solid fa-comment mr-2"></i>Comments ({comments[selectedVideo.id]?.length || 0})
                </button>
              </div>
              
              {/* Comments Section */}
              {showComments && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Comments</h3>
                  
                  {/* Add Comment Form */}
                  <div className="flex gap-3 mb-4">
                    <img src={user.avatar} className="w-10 h-10 rounded-full" alt="" />
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-3 py-2 border rounded-lg resize-none"
                        rows={2}
                      />
                      <button
                        onClick={() => handleAddComment(selectedVideo.id)}
                        className="mt-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>
                  
                  {/* Comments List */}
                  <div className="space-y-4">
                    {(comments[selectedVideo.id] || []).map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <img src={comment.userAvatar} className="w-10 h-10 rounded-full" alt="" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{comment.userName}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1">{comment.text}</p>
                          {(comment.userId === user.id || selectedVideo.userId === user.id) && (
                            <button
                              onClick={() => handleDeleteComment(selectedVideo.id, comment.id)}
                              className="mt-2 text-sm text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!comments[selectedVideo.id] || comments[selectedVideo.id].length === 0) && (
                      <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.length > 0 ? filteredVideos.map(video => (
                <div
                  key={video.id}
                  className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="aspect-video bg-gray-200 relative">
                    <img src={video.thumbnail} className="w-full h-full object-cover" alt="" />
                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                      {video.duration}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <img src={video.userAvatar} className="w-6 h-6 rounded-full" alt="" />
                      <span className="text-sm text-gray-600">{video.userName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span><i className="fa-solid fa-eye mr-1"></i>{video.views}</span>
                      <span><i className="fa-solid fa-heart mr-1"></i>{video.likes}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <i className="fa-solid fa-video text-4xl mb-4"></i>
                  <p>No videos found. Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Meetings Tab */}
      {activeTab === 'meetings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map(meeting => (
            <div key={meeting.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={meeting.hostAvatar} className="w-12 h-12 rounded-full" alt="" />
                  <div>
                    <h3 className="font-semibold">{meeting.title}</h3>
                    <p className="text-sm text-gray-600">Hosted by {meeting.hostName}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  meeting.status === 'live' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {meeting.status}
                </span>
              </div>
              <p className="text-gray-700 mb-4">{meeting.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span><i className="fa-solid fa-calendar mr-1"></i>{new Date(meeting.scheduledTime).toLocaleString()}</span>
                <span><i className="fa-solid fa-clock mr-1"></i>{meeting.duration} min</span>
                <span><i className="fa-solid fa-users mr-1"></i>{meeting.participants.length}/{meeting.maxParticipants}</span>
              </div>
              <div className="flex gap-2">
                {!meeting.participants.some(p => p.id === user.id) ? (
                  <button
                    onClick={() => handleJoinMeeting(meeting.id)}
                    className="flex-1 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                  >
                    <i className="fa-solid fa-video mr-2"></i>Join Meeting
                  </button>
                ) : (
                  <button
                    onClick={() => handleLeaveMeeting(meeting.id)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <i className="fa-solid fa-door-open mr-2"></i>Leave Meeting
                  </button>
                )}
                {meeting.hostId === user.id && meeting.status === 'scheduled' && (
                  <button
                    onClick={() => handleCancelMeeting(meeting.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Video Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Upload Video</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleVideoUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Video title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Video description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option>Education</option>
                  <option>Business</option>
                  <option>Technology</option>
                  <option>Lifestyle</option>
                  <option>Entertainment</option>
                  <option>Science</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="problem-solving, tutorial, education"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Video File *</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setUploadForm({...uploadForm, videoFile: e.target.files?.[0] || null})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadForm({...uploadForm, thumbnailFile: e.target.files?.[0] || null})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#1877F2] h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Schedule Meeting</h2>
              <button
                onClick={() => setShowMeetingModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleScheduleMeeting} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meeting Title *</label>
                <input
                  type="text"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Meeting title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={meetingForm.description}
                  onChange={(e) => setMeetingForm({...meetingForm, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Meeting description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={meetingForm.scheduledTime}
                  onChange={(e) => setMeetingForm({...meetingForm, scheduledTime: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={meetingForm.duration}
                  onChange={(e) => setMeetingForm({...meetingForm, duration: parseInt(e.target.value) || 60})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="60"
                  min="15"
                  max="480"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Participants</label>
                <input
                  type="number"
                  value={meetingForm.maxParticipants}
                  onChange={(e) => setMeetingForm({...meetingForm, maxParticipants: parseInt(e.target.value) || 50})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="50"
                  min="2"
                  max="500"
                />
              </div>
              <button
                type="submit"
                disabled={isScheduling}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScheduling ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
