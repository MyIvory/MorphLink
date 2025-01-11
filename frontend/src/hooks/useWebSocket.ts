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
    wsServiceRef.current = new WebSocketService(url);

    wsServiceRef.current.onConnect(() => setConnected(true));
    wsServiceRef.current.onDisconnect(() => setConnected(false));

    return () => {
      wsServiceRef.current?.disconnect();
      wsServiceRef.current = null;
    };
  }, [url]);

  const connect = useCallback(() => {
    wsServiceRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsServiceRef.current?.disconnect();
  }, []);

  const emit = useCallback(<T extends EventNames>(event: T, data: EventsMap[T]) => {
    wsServiceRef.current?.emit(event, data);
  }, []);

  const on = useCallback(<T extends EventNames>(event: T, handler: MessageHandler<T>) => {
    wsServiceRef.current?.on(event, handler);
  }, []);

  const off = useCallback(<T extends EventNames>(event: T, handler: MessageHandler<T>) => {
    wsServiceRef.current?.off(event, handler);
  }, []);

  return {
    connected,
    connect,
    disconnect,
    emit,
    on,
    off
  };
};
