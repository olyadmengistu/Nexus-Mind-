import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, LiveStream, LiveChatMessage, StreamViewer } from '../types';

interface LiveStreamProps {
  user: User;
  stream: LiveStream;
  isStreamer: boolean;
  onEndStream?: () => void;
  onLikeStream?: () => void;
}

const LiveStream: React.FC<LiveStreamProps> = ({ 
  user, 
  stream, 
  isStreamer, 
  onEndStream,
  onLikeStream 
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [viewerCount, setViewerCount] = useState(stream.viewers);
  const [likeCount, setLikeCount] = useState(stream.likes);
  const [duration, setDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [viewers, setViewers] = useState<StreamViewer[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const viewerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize local stream for streamer
  useEffect(() => {
    if (isStreamer) {
      initializeLocalStream();
    }
    
    // Simulate viewer count updates
    viewerIntervalRef.current = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(0, prev + change);
      });
    }, 5000);

    // Track stream duration
    if (stream.status === 'live' && stream.startedAt) {
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - stream.startedAt!) / 1000);
        setDuration(elapsed);
      }, 1000);
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (viewerIntervalRef.current) {
        clearInterval(viewerIntervalRef.current);
      }
    };
  }, [isStreamer, stream.status, stream.startedAt]);

  const initializeLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Prepare for backend: send stream initialization
      console.log('Backend: Initialize stream payload', {
        streamId: stream.id,
        streamerId: user.id,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera or microphone. Please check permissions.');
    }
  };

  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        // Prepare for backend: send mute state
        console.log('Backend: Toggle mute payload', {
          streamId: stream.id,
          isMuted: !audioTrack.enabled,
          timestamp: Date.now()
        });
      }
    }
  }, [localStream, stream.id]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        
        // Prepare for backend: send video state
        console.log('Backend: Toggle video payload', {
          streamId: stream.id,
          isVideoOff: !videoTrack.enabled,
          timestamp: Date.now()
        });
      }
    }
  }, [localStream, stream.id]);

  const toggleScreenShare = useCallback(async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (localStream) {
          const videoTrack = screenStream.getVideoTracks()[0];
          localStream.removeTrack(localStream.getVideoTracks()[0]);
          localStream.addTrack(videoTrack);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
          
          videoTrack.onended = () => {
            toggleScreenShare();
          };
        }
        
        setIsScreenSharing(true);
        
        // Prepare for backend: send screen share state
        console.log('Backend: Start screen share payload', {
          streamId: stream.id,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      // Revert to camera
      await initializeLocalStream();
      setIsScreenSharing(false);
      
      // Prepare for backend: send screen share end
      console.log('Backend: End screen share payload', {
        streamId: stream.id,
        timestamp: Date.now()
      });
    }
  }, [isScreenSharing, localStream]);

  const toggleRecording = useCallback(() => {
    if (!isRecording && localStream) {
      const mediaRecorder = new MediaRecorder(localStream);
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Prepare for backend: send recording data
        console.log('Backend: Recording completed payload', {
          streamId: stream.id,
          recordingUrl: url,
          timestamp: Date.now()
        });
        
        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `stream-${stream.id}-${Date.now()}.webm`;
        a.click();
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      // Prepare for backend: send recording start
      console.log('Backend: Start recording payload', {
        streamId: stream.id,
        timestamp: Date.now()
      });
    } else if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
      
      // Prepare for backend: send recording stop
      console.log('Backend: Stop recording payload', {
        streamId: stream.id,
        timestamp: Date.now()
      });
    }
  }, [isRecording, localStream, stream.id]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    
    const message: LiveChatMessage = {
      id: Date.now().toString(),
      streamId: stream.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: newMessage,
      timestamp: Date.now(),
      isModerator: false,
      isStreamer: isStreamer
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Prepare for backend: send chat message
    console.log('Backend: Send chat message payload', {
      streamId: stream.id,
      message,
      timestamp: Date.now()
    });
  }, [newMessage, user, stream.id, isStreamer]);

  const handleLike = useCallback(() => {
    setLikeCount(prev => prev + 1);
    if (onLikeStream) {
      onLikeStream();
    }
    
    // Prepare for backend: send like
    console.log('Backend: Like stream payload', {
      streamId: stream.id,
      userId: user.id,
      timestamp: Date.now()
    });
  }, [stream.id, user.id, onLikeStream]);

  const handleEndStream = useCallback(() => {
    if (confirm('Are you sure you want to end this stream?')) {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      
      // Prepare for backend: send end stream
      console.log('Backend: End stream payload', {
        streamId: stream.id,
        streamerId: user.id,
        duration,
        viewerCount,
        likeCount,
        timestamp: Date.now()
      });
      
      if (onEndStream) {
        onEndStream();
      }
    }
  }, [localStream, isRecording, stream.id, user.id, duration, viewerCount, likeCount, onEndStream]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-black rounded-lg overflow-hidden relative flex-1">
          {/* Stream Status Badge */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            {stream.status === 'live' && (
              <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="font-semibold">LIVE</span>
              </div>
            )}
            <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full">
              <i className="fa-solid fa-eye mr-1"></i>
              {viewerCount}
            </div>
            <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full">
              <i className="fa-solid fa-heart mr-1"></i>
              {likeCount}
            </div>
            {duration > 0 && (
              <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full">
                <i className="fa-solid fa-clock mr-1"></i>
                {formatDuration(duration)}
              </div>
            )}
            {isRecording && (
              <div className="bg-red-600 text-white px-3 py-1 rounded-full">
                <i className="fa-solid fa-circle mr-1"></i>
                REC
              </div>
            )}
          </div>

          {/* Video Element */}
          {isStreamer ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              src={stream.streamUrl}
            />
          )}

          {/* Stream Controls (Streamer Only) */}
          {isStreamer && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full ${
                  isMuted ? 'bg-red-600' : 'bg-gray-800'
                } text-white hover:opacity-80 transition-opacity`}
              >
                <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
              </button>
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${
                  isVideoOff ? 'bg-red-600' : 'bg-gray-800'
                } text-white hover:opacity-80 transition-opacity`}
              >
                <i className={`fa-solid ${isVideoOff ? 'fa-video-slash' : 'fa-video'}`}></i>
              </button>
              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full ${
                  isScreenSharing ? 'bg-blue-600' : 'bg-gray-800'
                } text-white hover:opacity-80 transition-opacity`}
              >
                <i className="fa-solid fa-desktop"></i>
              </button>
              <button
                onClick={toggleRecording}
                className={`p-3 rounded-full ${
                  isRecording ? 'bg-red-600' : 'bg-gray-800'
                } text-white hover:opacity-80 transition-opacity`}
              >
                <i className="fa-solid fa-circle"></i>
              </button>
              <button
                onClick={handleEndStream}
                className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <i className="fa-solid fa-phone-slash"></i>
              </button>
            </div>
          )}

          {/* Viewer Actions */}
          {!isStreamer && (
            <div className="absolute bottom-4 right-4 z-10 flex gap-2">
              <button
                onClick={handleLike}
                className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                <i className="fa-solid fa-heart"></i>
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                <i className="fa-solid fa-comment"></i>
              </button>
            </div>
          )}
        </div>

        {/* Stream Info */}
        <div className="bg-white rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <img src={stream.streamerAvatar} className="w-12 h-12 rounded-full" alt="" />
            <div className="flex-1">
              <h2 className="text-xl font-bold">{stream.title}</h2>
              <p className="text-gray-600">{stream.streamerName}</p>
              <p className="text-gray-700 mt-2">{stream.description}</p>
              <div className="flex gap-2 mt-2">
                {stream.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat */}
      {showChat && stream.allowChat && (
        <div className="w-full lg:w-80 bg-white rounded-lg flex flex-col h-[600px] lg:h-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Live Chat</h3>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <p className="text-gray-500 text-center">No messages yet</p>
            ) : (
              chatMessages.map(message => (
                <div key={message.id} className="flex gap-2">
                  <img src={message.userAvatar} className="w-8 h-8 rounded-full" alt="" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${
                        message.isStreamer ? 'text-red-600' : 
                        message.isModerator ? 'text-blue-600' : 'text-gray-800'
                      }`}>
                        {message.userName}
                        {message.isStreamer && <i className="fa-solid fa-badge text-xs ml-1"></i>}
                        {message.isModerator && <i className="fa-solid fa-shield text-xs ml-1"></i>}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{message.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Send a message..."
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStream;
