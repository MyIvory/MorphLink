import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinRoomDto, FaceDataDto } from './types/face-data.type';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['content-type'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class FaceGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FaceGateway.name);

  @SubscribeMessage('join_room')
  async handleJoinRoom(client: Socket, payload: any) {
    try {
      this.logger.log(`[WS] Received join_room event from client ${client.id} with payload:`, payload);
      
      // Перевіряємо що payload - це об'єкт з room
      if (!payload || typeof payload.room !== 'string') {
        this.logger.error('[WS] Invalid room data:', payload);
        throw new Error('Invalid room data');
      }

      const { room } = payload;
      
      this.logger.log(`[WS] Client ${client.id} joining room: ${room}`);
      
      await client.join(room);
      
      const response = { room };
      this.logger.log(`[WS] Sending joined event to client ${client.id} with data:`, response);
      
      // Відправляємо підтвердження з тією ж кімнатою
      client.emit('joined', response);
      
      this.logger.log(`[WS] Client ${client.id} joined room: ${room}`);
      return response;
    } catch (error) {
      this.logger.error('[WS] Error in handleJoinRoom:', error);
      throw error;
    }
  }

  @SubscribeMessage('face_data')
  async handleFaceData(client: Socket, payload: any) {
    try {
      this.logger.debug(`[WS] Received face_data event from client ${client.id} with payload:`, payload);
      
      // Перевіряємо структуру даних
      if (!payload || !payload.roomId || !payload.faceData) {
        this.logger.error('[WS] Invalid face data:', payload);
        throw new Error('Invalid face data');
      }

      const { roomId, faceData } = payload;
      
      this.logger.log(`[WS] Received face data from client ${client.id} for room: ${roomId}`);
      
      // Відправляємо дані всім в кімнаті, крім відправника
      client.to(roomId).emit('face_data', payload);
      
      return payload;
    } catch (error) {
      this.logger.error('[WS] Error in handleFaceData:', error);
      throw error;
    }
  }

  afterInit() {
    this.logger.log('[WS] WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`[WS] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[WS] Client disconnected: ${client.id}`);
  }
}
