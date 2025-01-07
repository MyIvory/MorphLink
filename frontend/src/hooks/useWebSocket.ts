import { useCallback, useEffect, useRef, useState } from 'react';
import { WebSocketService } from '../services/websocket.service';
import { WebSocketEvents } from '../types/websocket.types';

type EventsMap = WebSocketEvents;
type EventNames = keyof EventsMap;
type MessageHandler<T extends EventNames> = (data: EventsMap[T]) => void;

export const useWebSocket = (url: string) => {
  const [connected, setConnected] = useState(false);
  const wsServiceRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    console.log('[useWebSocket] Creating new WebSocket service');
    wsServiceRef.current = new WebSocketService(url);

    const handleConnect = () => {
      console.log('[useWebSocket] Connected');
      setConnected(true);
    };

    const handleDisconnect = () => {
      console.log('[useWebSocket] Disconnected');
      setConnected(false);
    };

    wsServiceRef.current.onConnect(handleConnect);
    wsServiceRef.current.onDisconnect(handleDisconnect);
    wsServiceRef.current.connect();

    return () => {
      console.log('[useWebSocket] Cleaning up');
      wsServiceRef.current?.disconnect();
      wsServiceRef.current = null;
    };
  }, [url]);

  const emit = useCallback(<T extends EventNames>(event: T, data: EventsMap[T]) => {
    console.log('[useWebSocket] Emitting event:', event, data);
    wsServiceRef.current?.emit(event, data);
  }, []);

  const on = useCallback(<T extends EventNames>(event: T, handler: MessageHandler<T>) => {
    console.log('[useWebSocket] Subscribing to event:', event);
    wsServiceRef.current?.on(event, handler);
  }, []);

  const off = useCallback(<T extends EventNames>(event: T, handler: MessageHandler<T>) => {
    console.log('[useWebSocket] Unsubscribing from event:', event);
    wsServiceRef.current?.off(event, handler);
  }, []);

  return {
    connected,
    emit,
    on,
    off,
    wsService: wsServiceRef.current
  };
};
