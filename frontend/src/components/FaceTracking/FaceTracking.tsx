import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { FaceDataEvent } from '../../types/websocket.types';

interface FaceTrackingProps {
  stream: MediaStream | undefined;
  onFaceData: (faceData: FaceDataEvent['faceData']) => void;
}

export const FaceTracking: React.FC<FaceTrackingProps> = ({ stream, onFaceData }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const UPDATE_INTERVAL = 10;
  const [showPoints, setShowPoints] = useState(true);

  useEffect(() => {
    if (!stream || !videoRef.current) {
      console.log('[FaceTracking] No stream or video element');
      return;
    }

    const video = videoRef.current;
    video.srcObject = stream;
    
    video.onloadedmetadata = () => {
      console.log('[FaceTracking] Video metadata loaded');
      video.play()
        .then(() => console.log('[FaceTracking] Video playing'))
        .catch(error => console.error('[FaceTracking] Error playing video:', error));
    };

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  const detectFace = useCallback(async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const displaySize = { width: video.width, height: video.height };

    const now = Date.now();
    if (now - lastUpdateRef.current < UPDATE_INTERVAL) {
      frameRef.current = requestAnimationFrame(detectFace);
      return;
    }
    lastUpdateRef.current = now;

    try {
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections) {
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // Малюємо точки тільки якщо вони включені і канвас існує
        if (showPoints && canvasRef.current) {
          const canvas = canvasRef.current;
          faceapi.matchDimensions(canvas, displaySize);
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00FF00';
            resizedDetections.landmarks.positions.forEach(point => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
              ctx.fill();
            });
          }
        }

        const faceData = {
          landmarks: {
            points: resizedDetections.landmarks.positions.map(point => ({
              x: point.x,
              y: point.y
            }))
          },
          expressions: {
            happy: resizedDetections.expressions.happy,
            sad: resizedDetections.expressions.sad,
            angry: resizedDetections.expressions.angry
          }
        };
        
        onFaceData(faceData);
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }

    frameRef.current = requestAnimationFrame(detectFace);
  }, [onFaceData, showPoints]);

  useEffect(() => {
    if (!stream || !videoRef.current) return;

    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        console.log('[FaceTracking] Models loaded');
        frameRef.current = requestAnimationFrame(detectFace);
      } catch (error) {
        console.error('[FaceTracking] Error loading models:', error);
      }
    };

    loadModels();

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [stream, detectFace]);

  return (
    <div style={{ position: 'relative', width: '640px', height: '480px' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width={640}
        height={480}
        style={{ 
          width: '100%',
          height: '100%',
          transform: 'scaleX(-1)',
          objectFit: 'cover',
          background: '#000'
        }}
      />
      <button
        onClick={() => setShowPoints(!showPoints)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          padding: '8px 16px',
          background: '#4a4a4a',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        {showPoints ? 'Hide Points' : 'Show Points'}
      </button>
      {showPoints && (
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'scaleX(-1)',
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
};
