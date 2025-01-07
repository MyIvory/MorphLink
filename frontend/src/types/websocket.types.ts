export interface JoinRoomEvent {
  room: string;
}

export interface FaceDataEvent {
  roomId: string;
  faceData: {
    landmarks: {
      points: Array<{
        x: number;
        y: number;
      }>;
    };
    expressions: {
      happy: number;
      sad: number;
      angry: number;
    };
  };
}

export type EventNames = keyof WebSocketEvents;

export type MessageHandler<T extends EventNames> = (data: WebSocketEvents[T]) => void;

export interface WebSocketEvents {
  'join_room': JoinRoomEvent;
  'joined': JoinRoomEvent;
  'face_data': FaceDataEvent;
  'connect': void;
  'disconnect': void;
  'connect_error': Error;
}
