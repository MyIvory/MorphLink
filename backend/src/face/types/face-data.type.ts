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

export interface FaceData {
  landmarks: FaceLandmarks;
  expressions: FaceExpressions;
}

export interface JoinRoomDto {
  room: string;
}

export interface FaceDataDto {
  roomId: string;
  faceData: FaceData;
}
