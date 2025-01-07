import React, { useEffect, useRef, useState } from 'react';
import { FaceDataEvent } from '../../types/websocket.types';
import styles from './FaceMask.module.css';

interface FaceMaskProps {
  faceData: FaceDataEvent['faceData'] | null;
}

export const FaceMask: React.FC<FaceMaskProps> = ({ faceData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image] = useState<HTMLImageElement>(() => {
    const img = new Image();
    img.src = '/mask.svg';
    img.onload = () => console.log('Mask image loaded');
    img.onerror = (e) => console.error('Error loading mask image:', e);
    return img;
  });

  useEffect(() => {
    if (!canvasRef.current || !faceData) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('No canvas context');
      return;
    }

    // Очищаємо canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (faceData.landmarks) {
      const jaw = faceData.landmarks.points.slice(0, 17);
      const leftEye = faceData.landmarks.points.slice(36, 42);
      const rightEye = faceData.landmarks.points.slice(42, 48);

      // Обчислюємо розмір і позицію маски
      const minX = Math.min(...jaw.map(p => p.x));
      const maxX = Math.max(...jaw.map(p => p.x));
      const minY = Math.min(
        ...leftEye.map(p => p.y),
        ...rightEye.map(p => p.y)
      );
      const maxY = Math.max(...jaw.map(p => p.y));
      
      const width = maxX - minX;
      const height = maxY - minY;

      // Малюємо маску
      ctx.drawImage(image, minX, minY, width, height);
    }
  }, [faceData, image]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.faceMask}
      width={640}
      height={480}
    />
  );
};
