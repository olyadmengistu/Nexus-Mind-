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
  }, []);

  const handleLikeVideo = (videoId: string) => {
    setVideos(videos.map(v => 
      v.id === videoId ? { ...v, likes: v.likes + 1 } : v
    ));
  };

  const handleJoinMeeting = (meetingId: string) => {
    setMeetings(meetings.map(m => 
      m.id === meetingId 
        ? { ...m, participants: [...m.participants, user] }
        : m
    ));
  };

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
              <div className="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
                <i className="fa-solid fa-play text-white text-6xl"></i>
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
              <button
                onClick={() => handleLikeVideo(selectedVideo.id)}
                className="mt-4 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
              >
                <i className="fa-solid fa-heart mr-2"></i>Like
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map(video => (
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
              ))}
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
              <button
                onClick={() => handleJoinMeeting(meeting.id)}
                className="w-full px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
              >
                <i className="fa-solid fa-video mr-2"></i>Join Meeting
              </button>
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
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Video title" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full px-3 py-2 border rounded-lg" rows={3} placeholder="Video description" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Education</option>
                  <option>Business</option>
                  <option>Technology</option>
                  <option>Lifestyle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Video File</label>
                <input type="file" accept="video/*" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="w-full px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
              >
                Upload
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
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meeting Title</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Meeting title" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full px-3 py-2 border rounded-lg" rows={3} placeholder="Meeting description" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input type="datetime-local" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg" placeholder="60" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Participants</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg" placeholder="50" />
              </div>
              <button
                type="button"
                onClick={() => setShowMeetingModal(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Schedule Meeting
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
