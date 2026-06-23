
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message, Conversation } from '../types';
import { searchConversations, debounce } from '../lib/searchApi';
import { socketClient } from '../lib/api';
import { conversationsApi } from '../lib/firebaseApi';

interface MessagesProps {
  user: User;
}

const Messages: React.FC<MessagesProps> = ({ user }) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCallModal, setShowCallModal] = useState<{ type: 'audio' | 'video' | null }>({ type: null });
  const [newChatUser, setNewChatUser] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = socketClient.connect();
    socketClient.join(user.id);

    // Listen for new messages
    socketClient.on('new_message', (message: Message) => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedChat) {
          return {
            ...conv,
            messages: [...conv.messages, message],
            lastMessage: message.text,
            time: formatTime(message.timestamp)
          };
        }
        return conv;
      }));
    });

    // Listen for typing indicators
    socketClient.on('user_typing', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      console.log(`User ${userId} is typing: ${isTyping}`);
    });

    // Listen for real-time notifications
    socketClient.on('notification', (notification: any) => {
      console.log('New notification received:', notification);
    });

    return () => {
      socketClient.disconnect();
    };
  }, [user.id, selectedChat]);

  // Initialize conversations from Firestore
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await conversationsApi.getAllConversations();
        const userConversations = data.filter((conv: Conversation) => 
          conv.participants.some(p => p.id === user.id)
        ) as Conversation[];
        setConversations(userConversations);
        if (userConversations.length > 0) {
          setSelectedChat(userConversations[0].id);
        }
      } catch (error) {
        console.error('Error loading conversations from Firestore:', error);
        setConversations([]);
      }
    };
    loadConversations();
  }, [user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations, selectedChat]);


  function formatTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  function formatMessageTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== user.id) || conversation.participants[0];
  };

  // Debounced search function for conversations
  const debouncedConversationSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim()) {
        setIsSearching(true);
        try {
          const response = await searchConversations({ query, limit: 50 });
          setFilteredConversations(response.data);
        } catch (error) {
          console.error('Conversation search error:', error);
          setFilteredConversations([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setFilteredConversations(conversations);
      }
    }, 300),
    [conversations]
  );

  // Trigger search when search query changes
  useEffect(() => {
    debouncedConversationSearch(searchQuery);
  }, [searchQuery, debouncedConversationSearch]);

  // Initialize filteredConversations with all conversations on mount
  useEffect(() => {
    setFilteredConversations(conversations);
  }, [conversations]);

  const selectedConversation = conversations.find(c => c.id === selectedChat);
  const otherUser = selectedConversation ? getOtherParticipant(selectedConversation) : null;

  const handleSend = async () => {
    if (!messageText.trim() || !selectedChat) return;
    
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: user.id,
      text: messageText.trim(),
      timestamp: Date.now()
    };

    try {
      // Send via WebSocket for real-time delivery
      socketClient.sendMessage(selectedChat, {
        ...newMessage,
        senderName: user.name,
        senderAvatar: user.avatar
      });

      // Save to Firestore
      await conversationsApi.sendMessage(selectedChat, newMessage);

      // Update local state immediately for optimistic UI
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedChat) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: messageText.trim(),
            time: formatTime(Date.now())
          };
        }
        return conv;
      }));
      
      setMessageText('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateNewChat = async () => {
    if (!newChatUser.trim()) return;
    
    const newConversation: Conversation = {
      id: `c${Date.now()}`,
      participants: [
        user,
        { id: `u${Date.now()}`, name: newChatUser, username: newChatUser.toLowerCase().replace(/\s+/g, ''), email: `${newChatUser.toLowerCase()}@example.com`, avatar: `https://picsum.photos/seed/${newChatUser}/100/100`, reputation: 0 }
      ],
      messages: [],
      lastMessage: 'New conversation',
      time: 'Just now',
      timestamp: Date.now()
    };

    try {
      const { id: _localId, ...conversationPayload } = newConversation;
      const created = await conversationsApi.createConversation(conversationPayload);
      setConversations(prev => [created as Conversation, ...prev]);
      setSelectedChat(created.id);
      setNewChatUser('');
      setShowNewChatModal(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleStartCall = (type: 'audio' | 'video') => {
    setShowCallModal({ type });
  };

  const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👎', '❤️', '🔥', '✨', '🎉', '💯', '🙌', '👋', '😊', '🤗', '😇', '🤩', '😋'];

  const handleEmojiSelect = (emoji: string) => {
    setMessageText(prev => prev + emoji);
  };

  const handleAttachment = (type: 'image' | 'note' | 'gift') => {
    // Placeholder for attachment handling - ready for backend integration
    console.log(`Attachment type: ${type} - Ready for backend integration`);
    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} attachment feature ready for backend integration`);
  };

  return (
    <div className="flex h-[calc(100vh-56px)] bg-white">
      {/* Sidebar */}
      <div className="w-[360px] border-r border-gray-200 flex flex-col">
        <div className="p-4 flex items-center justify-between">
           <h1 className="text-2xl font-bold">Chats</h1>
           <div className="flex gap-2">
             <button className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center" title="More options">
               <i className="fa-solid fa-ellipsis"></i>
             </button>
             <button 
               onClick={() => setShowNewChatModal(true)}
               className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
               title="New message"
             >
               <i className="fa-solid fa-pen-to-square"></i>
             </button>
           </div>
        </div>
        <div className="px-4 mb-4">
           <div className="relative">
             <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
             <input 
               type="text" 
               placeholder="Search Messenger" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-full outline-none"
             />
             {isSearching && (
               <i className="fa-solid fa-spinner fa-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
             )}
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const otherUser = getOtherParticipant(conv);
              return (
                <div 
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className={`flex items-center gap-3 p-2 mx-2 rounded-lg cursor-pointer transition-colors ${selectedChat === conv.id ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                >
                  <img src={otherUser.avatar} className="w-14 h-14 rounded-full" alt="Chat" />
                  <div className="flex-1">
                     <p className="font-semibold">{otherUser.name}</p>
                     <p className="text-sm text-gray-500 truncate w-[180px]">{conv.lastMessage} · {conv.time}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation && otherUser ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-gray-200 flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-3">
                 <img src={otherUser.avatar} className="w-10 h-10 rounded-full" alt="Avatar" />
                 <div>
                   <p className="font-bold">{otherUser.name}</p>
                   <p className="text-xs text-gray-500">Active {selectedConversation.time}</p>
                 </div>
               </div>
               <div className="flex gap-5 text-[#1877F2] text-xl">
                 <i 
                   onClick={() => handleStartCall('audio')}
                   className="fa-solid fa-phone cursor-pointer hover:text-blue-600"
                   title="Voice call"
                 ></i>
                 <i 
                   onClick={() => handleStartCall('video')}
                   className="fa-solid fa-video cursor-pointer hover:text-blue-600"
                   title="Video call"
                 ></i>
                 <i 
                   onClick={() => setShowChatInfo(!showChatInfo)}
                   className="fa-solid fa-circle-info cursor-pointer hover:text-blue-600"
                   title="Chat info"
                 ></i>
               </div>
            </div>

            {/* Chat Info Panel */}
            {showChatInfo && (
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <img src={otherUser.avatar} className="w-16 h-16 rounded-full" alt="Avatar" />
                  <div>
                    <p className="font-bold text-lg">{otherUser.name}</p>
                    <p className="text-gray-500">@{otherUser.username}</p>
                    <p className="text-sm text-gray-500">Reputation: {otherUser.reputation}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-[#1877F2] text-white py-2 rounded-lg hover:bg-blue-600">
                    View Profile
                  </button>
                  <button className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
                    Search in conversation
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 bg-white p-4 overflow-y-auto flex flex-col gap-2">
              {selectedConversation.messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                selectedConversation.messages.map((msg) => {
                  const isOwn = msg.senderId === user.id;
                  const sender = isOwn ? user : otherUser;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[60%] ${isOwn ? 'bg-[#1877F2] text-white' : 'bg-gray-200'} p-3 rounded-2xl`}>
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          {formatMessageTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-20 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                <div className="grid grid-cols-5 gap-2">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-2xl hover:bg-gray-100 p-1 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center gap-3 relative">
              <div className="flex gap-4 text-[#1877F2] text-xl">
                <i 
                  onClick={() => handleAttachment('image')}
                  className="fa-solid fa-circle-plus cursor-pointer hover:text-blue-600"
                  title="Add attachment"
                ></i>
                <i 
                  onClick={() => handleAttachment('image')}
                  className="fa-solid fa-image cursor-pointer hover:text-blue-600"
                  title="Send image"
                ></i>
                <i 
                  onClick={() => handleAttachment('note')}
                  className="fa-solid fa-note-sticky cursor-pointer hover:text-blue-600"
                  title="Send note"
                ></i>
                <i 
                  onClick={() => handleAttachment('gift')}
                  className="fa-solid fa-gift cursor-pointer hover:text-blue-600"
                  title="Send gift"
                ></i>
              </div>
              <div className="flex-1 relative">
                 <input 
                    type="text" 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Aa" 
                    className="w-full bg-gray-100 px-4 py-2 rounded-full outline-none"
                 />
                 <i 
                   onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                   className="fa-regular fa-face-smile absolute right-3 top-1/2 -translate-y-1/2 text-[#1877F2] cursor-pointer hover:text-blue-600"
                 ></i>
              </div>
              <i 
                onClick={handleSend}
                className={`fa-solid fa-paper-plane text-xl cursor-pointer ${messageText.trim() ? 'text-[#1877F2]' : 'text-gray-400'}`}
              ></i>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <i className="fa-solid fa-comments text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-lg">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Start a new conversation</h2>
            <input
              type="text"
              placeholder="Enter username or name"
              value={newChatUser}
              onChange={(e) => setNewChatUser(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateNewChat()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 outline-none focus:border-blue-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatUser('');
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewChat}
                className="px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-blue-600"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {showCallModal.type && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-sm text-center">
            <div className="mb-6">
              {otherUser && (
                <>
                  <img src={otherUser.avatar} className="w-24 h-24 rounded-full mx-auto mb-4" alt="Avatar" />
                  <p className="text-xl font-bold">{otherUser.name}</p>
                  <p className="text-gray-500">
                    {showCallModal.type === 'audio' ? 'Voice call' : 'Video call'}
                  </p>
                </>
              )}
            </div>
            <div className="flex justify-center gap-4 mb-4">
              <div className="animate-pulse text-green-500">
                <i className={`fa-solid ${showCallModal.type === 'audio' ? 'fa-phone' : 'fa-video'} text-3xl`}></i>
              </div>
            </div>
            <p className="text-gray-500 mb-6">Calling... (Ready for backend integration)</p>
            <button
              onClick={() => setShowCallModal({ type: null })}
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
