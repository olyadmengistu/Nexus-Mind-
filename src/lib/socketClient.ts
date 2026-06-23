import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? '';

type EventHandler = (...args: unknown[]) => void;

class SocketClient {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<EventHandler>>();

  connect(): Socket | null {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL || undefined, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to NexusMind WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from NexusMind WebSocket');
    });

    for (const [event, handlers] of this.listeners) {
      for (const handler of handlers) {
        this.socket.on(event, handler);
      }
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  join(userId: string, deviceInfo?: { type: string; browser: string }, geographicInfo?: { country: string; city: string }): void {
    this.socket?.emit('join', { userId, deviceInfo, geographicInfo });
  }

  joinConversation(conversationId: string): void {
    this.socket?.emit('join_conversation', conversationId);
  }

  sendMessage(conversationId: string, message: Record<string, unknown>): void {
    this.socket?.emit('send_message', { conversationId, message });
  }

  sendTyping(conversationId: string, userId: string, isTyping: boolean): void {
    this.socket?.emit('typing', { conversationId, userId, isTyping });
  }

  trackPageView(page: string, userId?: string): void {
    this.socket?.emit('page_view', { page, userId });
  }

  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    this.socket?.on(event, handler);
  }

  off(event: string, handler?: EventHandler): void {
    if (handler) {
      this.listeners.get(event)?.delete(handler);
      this.socket?.off(event, handler);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }
}

export const socketClient = new SocketClient();
