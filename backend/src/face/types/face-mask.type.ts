export interface Point {
  x: number;
  y: number;
}

export interface FaceLandmarks {
  eyes: [Point, Point];
  nose: Point;
  mouth: Point[];
  contour: Point[];
}

export interface FaceExpressions {
  smile: number;
  eyesClosed: number;
}

export interface FaceMask {
  landmarks: FaceLandmarks;
  expressions: FaceExpressions;
  timestamp: number;
}
