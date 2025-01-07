import { Socket, io } from 'socket.io-client';
import { WebSocketEvents } from '../types/websocket.types';

type EventsMap = WebSocketEvents;
type EventNames = keyof EventsMap;
type MessageHandler<T extends EventNames> = (data: EventsMap[T]) => void;
type ConnectionHandler = () => void;

export class WebSocketService {
  private socket: Socket | null = null;
  private messageHandlers: Map<EventNames, Set<MessageHandler<any>>> = new Map();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private disconnectionHandlers: Set<ConnectionHandler> = new Set();
  private isConnectedRef: { current: boolean } = { current: false };

  constructor(private url: string) {
    console.log('[WS] Service initialized with URL:', this.url);
  }

  connect() {
    if (this.socket?.connected) {
      console.log('[WS] Already connected');
      return;
    }

    console.log('[WS] Connecting to:', this.url);
    this.socket = io(this.url, {
      transports: ['websocket'],
      autoConnect: false
    });

    // Налаштовуємо обробники подій
    this.socket.on('connect', () => {
      console.log('[WS] Connected');
      this.isConnectedRef.current = true;
      this.connectionHandlers.forEach(handler => handler());
    });

    this.socket.on('disconnect', () => {
      console.log('[WS] Disconnected');
      this.isConnectedRef.current = false;
      this.disconnectionHandlers.forEach(handler => handler());
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WS] Connection error:', error);
      this.isConnectedRef.current = false;
    });

    // Відновлюємо всі обробники подій
    for (const [event, handlers] of this.messageHandlers) {
      handlers.forEach(handler => {
        this.socket?.on(event as string, handler as (...args: any[]) => void);
      });
    }

    this.socket.connect();
  }

  disconnect() {
    console.log('[WS] Disconnecting');
    this.socket?.disconnect();
    this.socket = null;
    this.isConnectedRef.current = false;
  }

  emit<T extends EventNames>(event: T, data: EventsMap[T]) {
    if (!this.isConnectedRef.current || !this.socket?.connected) {
      console.warn('[WS] Cannot emit - socket not connected');
      return;
    }

    console.log(`[WS] Emitting event ${event}:`, data);
    this.socket.emit(event, data);
  }

  on<T extends EventNames>(event: T, handler: MessageHandler<T>) {
    console.log(`[WS] Adding handler for event: ${event}`);
    
    let handlers = this.messageHandlers.get(event);
    if (!handlers) {
      handlers = new Set();
      this.messageHandlers.set(event, handlers);
    }
    handlers.add(handler);

    if (this.socket) {
      console.log(`[WS] Socket exists, setting up immediate handler for: ${event}`);
      this.socket.on(event as string, handler as (...args: any[]) => void);
    }
  }

  off<T extends EventNames>(event: T, handler: MessageHandler<T>) {
    const handlers = this.messageHandlers.get(event);
    if (handlers?.has(handler)) {
      console.log(`[WS] Removing handler for event: ${event}`);
      handlers.delete(handler);
      
      if (this.socket) {
        this.socket.off(event);
        console.log(`[WS] Unsubscribed from event: ${event}`);
      }
    }
  }

  onConnect(handler: ConnectionHandler) {
    console.log('[WS] Adding connect handler');
    this.connectionHandlers.add(handler);
  }

  onDisconnect(handler: ConnectionHandler) {
    console.log('[WS] Adding disconnect handler');
    this.disconnectionHandlers.add(handler);
  }

  getConnectionStatus(): boolean {
    return this.isConnectedRef.current;
  }
}
