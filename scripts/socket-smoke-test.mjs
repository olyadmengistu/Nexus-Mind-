import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('Connected socket id:', socket.id);
  socket.emit('join', { userId: 'smoke-socket-user', deviceInfo: { type: 'node', browser: 'nodejs' }, geographicInfo: { country: 'test', city: 'node' } });
  socket.emit('page_view', { page: '/smoke-test', userId: 'smoke-socket-user' });
  socket.emit('join_conversation', 'smoke-conversation');
  socket.emit('send_message', { conversationId: 'smoke-conversation', message: { text: 'Hello from smoke socket test' } });
  socket.emit('typing', { conversationId: 'smoke-conversation', userId: 'smoke-socket-user', isTyping: true });
  setTimeout(() => {
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.error('Socket connect error:', error);
  process.exit(1);
});

socket.on('analytics_update', (data) => {
  console.log('analytics_update event', data);
});

socket.on('message_received', (data) => {
  console.log('message_received event', data);
});

socket.on('user_online', (data) => {
  console.log('user_online event', data);
});

socket.on('user_typing', (data) => {
  console.log('user_typing event', data);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});
