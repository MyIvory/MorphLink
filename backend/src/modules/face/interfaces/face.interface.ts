export interface Point {
  x: number;
  y: number;
}

export interface FaceLandmarks {
  points: Point[];
}

export interface FaceExpressions {
  happy: number;
  sad: number;
  angry: number;
}

export interface Face {
  landmarks: FaceLandmarks;
  expressions: FaceExpressions;
}

// WebSocket message interfaces
export interface FaceMessage {
  roomId: string;
  faceData: Face;
}

export interface JoinRoomMessage {
  room: string;
}
