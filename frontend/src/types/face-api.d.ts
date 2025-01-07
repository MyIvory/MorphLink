declare module '@vladmandic/face-api' {
  export const nets: {
    tinyFaceDetector: any;
    faceLandmark68Net: any;
    faceExpressionNet: any;
  };

  export interface FaceDetection {
    detection: {
      box: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    };
  }

  export interface FaceLandmarks {
    positions: Array<{ x: number; y: number }>;
  }

  export interface FaceExpressions {
    happy: number;
    sad: number;
    angry: number;
    neutral: number;
    surprised: number;
    disgusted: number;
    fearful: number;
  }

  export interface WithFaceLandmarks<T> {
    landmarks: FaceLandmarks;
    detection: T;
  }

  export interface WithFaceExpressions {
    expressions: FaceExpressions;
  }

  export class TinyFaceDetectorOptions {
    constructor(options?: { inputSize?: number; scoreThreshold?: number });
  }

  export interface DetectSingleFaceResult extends Promise<FaceDetection> {
    withFaceLandmarks(): DetectWithLandmarksResult;
  }

  export interface DetectWithLandmarksResult extends Promise<WithFaceLandmarks<FaceDetection>> {
    withFaceExpressions(): Promise<WithFaceLandmarks<FaceDetection> & WithFaceExpressions>;
  }

  export function detectSingleFace(
    input: HTMLVideoElement | HTMLCanvasElement,
    options: TinyFaceDetectorOptions
  ): DetectSingleFaceResult;

  export function loadTinyFaceDetectorModel(url: string): Promise<void>;
  export function loadFaceLandmarkModel(url: string): Promise<void>;
  export function loadFaceExpressionModel(url: string): Promise<void>;

  export function matchDimensions(
    canvas: HTMLCanvasElement,
    dimensions: { width: number; height: number }
  ): void;

  export function resizeResults(
    detection: WithFaceLandmarks<FaceDetection> & WithFaceExpressions,
    dimensions: { width: number; height: number }
  ): WithFaceLandmarks<FaceDetection> & WithFaceExpressions;

  export const draw: {
    drawFaceLandmarks(
      canvas: HTMLCanvasElement,
      results: WithFaceLandmarks<FaceDetection>
    ): void;
  };
}
