import { WebSocketEvents } from './websocket.types';

declare module 'socket.io-client' {
  interface ServerToClientEvents extends WebSocketEvents {}

  interface ClientToServerEvents extends WebSocketEvents {}
}
