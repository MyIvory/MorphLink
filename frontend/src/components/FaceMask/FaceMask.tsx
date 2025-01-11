import React, { useEffect, useRef } from 'react';
import { FaceDataEvent } from '../../types/websocket.types';
import styles from './FaceMask.module.css';

interface FaceMaskProps {
  faceData: FaceDataEvent['faceData'] | null;
}

export const FaceMask: React.FC<FaceMaskProps> = ({ faceData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !faceData?.landmarks) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Встановлюємо фіксований розмір canvas як у відео
    canvas.width = 640;
    canvas.height = 480;

    // Очищаємо canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const points = faceData.landmarks.points;

    // Функція для малювання точки
    const drawPoint = (point: {x: number, y: number}, color: string = '#00ff00', size: number = 3) => {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    // Функція для малювання лінії між точками
    const drawLine = (points: Array<{x: number, y: number}>, color: string = '#00ff00') => {
      if (!ctx || points.length < 2) return;
      
      // Малюємо чорну обведення
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Малюємо кольорову лінію
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    // Малюємо контур обличчя
    drawLine(points.slice(0, 17), '#ff0000');
    
    // Малюємо брови
    drawLine(points.slice(17, 22), '#00ff00'); // Ліва брова
    drawLine(points.slice(22, 27), '#00ff00'); // Права брова
    
    // Малюємо ніс
    drawLine(points.slice(27, 31), '#0000ff'); // Верхня частина
    drawLine(points.slice(31, 36), '#0000ff'); // Нижня частина
    
    // Малюємо очі
    drawLine([...points.slice(36, 42), points[36]], '#ffff00'); // Ліве око
    drawLine([...points.slice(42, 48), points[42]], '#ffff00'); // Праве око
    
    // Малюємо губи
    drawLine([...points.slice(48, 60), points[48]], '#ff00ff'); // Зовнішній контур
    drawLine([...points.slice(60, 68), points[60]], '#ff00ff'); // Внутрішній контур

    // Малюємо всі контрольні точки
    points.forEach(point => {
      drawPoint(point, '#ffffff', 1);
    });

  }, [faceData]);

  return (
    <div className={styles.maskContainer}>
      <canvas ref={canvasRef} className={styles.faceMask} />
    </div>
  );
};