import React, { useEffect, useRef } from 'react';
import { FaceDataEvent } from '../../types/websocket.types';
import styles from './FaceMask.module.css';

interface FaceMaskProps {
  faceData: FaceDataEvent['faceData'] | null;
}

interface Point {
  x: number;
  y: number;
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

    // Функція для створення проміжних точок
    const interpolatePoints = (points: Point[], steps: number = 5): Point[] => {
      const result: Point[] = [];
      
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        
        // Додаємо першу точку
        result.push(p1);
        
        // Додаємо проміжні точки
        for (let j = 1; j < steps; j++) {
          const t = j / steps;
          result.push({
            x: p1.x + (p2.x - p1.x) * t,
            y: p1.y + (p2.y - p1.y) * t
          });
        }
      }
      
      // Додаємо останню точку
      result.push(points[points.length - 1]);
      
      return result;
    };

    // Функція для малювання маски
    const drawMask = () => {
      if (!ctx) return;

      // Створюємо шлях для маски
      ctx.beginPath();

      // Малюємо контур обличчя знизу
      const jawLine = points.slice(0, 17);
      const leftEyebrow = points.slice(17, 22);
      const rightEyebrow = points.slice(22, 27).reverse();

      // Зміщуємо брови вгору для створення верхнього контуру маски
      const offset = 20; // пікселів вгору
      const upperLeftBrow = leftEyebrow.map(point => ({
        x: point.x,
        y: point.y - offset
      }));
      const upperRightBrow = rightEyebrow.map(point => ({
        x: point.x,
        y: point.y - offset
      }));

      // Створюємо згладжені контури
      const smoothJawLine = interpolatePoints(jawLine);
      const smoothUpperRightBrow = interpolatePoints(upperRightBrow);
      const smoothUpperLeftBrow = interpolatePoints(upperLeftBrow);

      // Починаємо з лівого краю щелепи
      ctx.moveTo(smoothJawLine[0].x, smoothJawLine[0].y);

      // Малюємо нижню частину
      smoothJawLine.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });

      // Малюємо праву частину вгору
      smoothUpperRightBrow.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });

      // Малюємо ліву частину
      smoothUpperLeftBrow.reverse().forEach(point => {
        ctx.lineTo(point.x, point.y);
      });

      // Замикаємо контур
      ctx.closePath();

      // Заливка маски
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fill();

      // Додаємо градієнт для об'ємного ефекту
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Малюємо чорні очі
      ctx.fillStyle = '#000000';
      
      // Ліве око
      const leftEye = points.slice(36, 42);
      const smoothLeftEye = interpolatePoints(leftEye);
      ctx.beginPath();
      ctx.moveTo(smoothLeftEye[0].x, smoothLeftEye[0].y);
      smoothLeftEye.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.fill();

      // Праве око
      const rightEye = points.slice(42, 48);
      const smoothRightEye = interpolatePoints(rightEye);
      ctx.beginPath();
      ctx.moveTo(smoothRightEye[0].x, smoothRightEye[0].y);
      smoothRightEye.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.fill();

      // Малюємо губи (зовнішня частина)
      const outerLips = points.slice(48, 60);
      const smoothOuterLips = interpolatePoints(outerLips);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(smoothOuterLips[0].x, smoothOuterLips[0].y);
      smoothOuterLips.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.lineTo(smoothOuterLips[0].x, smoothOuterLips[0].y);
      ctx.fill();

      // Малюємо рот (внутрішня частина)
      const innerLips = points.slice(60, 68);
      const smoothInnerLips = interpolatePoints(innerLips);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(smoothInnerLips[0].x, smoothInnerLips[0].y);
      smoothInnerLips.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.fill();

      // Малюємо ніздрі
      // Точки основи носа: 31-35
      const noseBase = points.slice(31, 36);
      
      // Ліва ніздря
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      const leftNostrilCenter = {
        x: (noseBase[0].x + noseBase[1].x) / 2,
        y: (noseBase[0].y + noseBase[1].y) / 2
      };
      ctx.ellipse(
        leftNostrilCenter.x,
        leftNostrilCenter.y,
        3, // radiusX
        2, // radiusY
        Math.PI / 4, // поворот
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Права ніздря
      ctx.beginPath();
      const rightNostrilCenter = {
        x: (noseBase[3].x + noseBase[4].x) / 2,
        y: (noseBase[3].y + noseBase[4].y) / 2
      };
      ctx.ellipse(
        rightNostrilCenter.x,
        rightNostrilCenter.y,
        3, // radiusX
        2, // radiusY
        -Math.PI / 4, // поворот в протилежну сторону
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Визначаємо домінуючу емоцію
      const emotions = faceData.expressions;
      const dominantEmotion = Object.entries(emotions).reduce((a, b) => 
        a[1] > b[1] ? a : b
      )[0];

      // Зберігаємо поточну трансформацію
      ctx.save();
      
      // Відміняємо відзеркалення для тексту
      ctx.scale(-1, 1);
      
      // Виводимо текст емоції
      ctx.font = '20px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.textAlign = 'right';
      const emotionText = dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1);
      const label = 'Emotion: ';
      // Так як текст відзеркалений, використовуємо від'ємну координату x
      ctx.fillText(label + emotionText, -20, 40);
      
      // Відновлюємо попередню трансформацію
      ctx.restore();
    };

    // Функція для малювання контурів з проміжними точками
    const drawSmoothLine = (points: Point[], color: string) => {
      const smoothPoints = interpolatePoints(points);
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(smoothPoints[0].x, smoothPoints[0].y);
      smoothPoints.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    };

    // Функція для малювання контурів
    const drawContours = () => {
      // Малюємо очі
      drawSmoothLine([...points.slice(36, 42), points[36]], '#000000'); // Ліве око
      drawSmoothLine([...points.slice(42, 48), points[42]], '#000000'); // Праве око
      
      // Малюємо губи
      drawSmoothLine([...points.slice(48, 60), points[48]], 'rgba(255, 255, 255, 0.1)'); // Зовнішній контур
      drawSmoothLine([...points.slice(60, 68), points[60]], 'rgba(255, 255, 255, 0.1)'); // Внутрішній контур
    };

    // Малюємо маску
    ctx.globalCompositeOperation = 'source-over';
    drawMask();

    // Малюємо контури поверх маски
    ctx.globalCompositeOperation = 'source-over';
    drawContours();
  }, [faceData]);

  return (
    <div className={styles.maskContainer}>
      <canvas ref={canvasRef} className={styles.faceMask} />
    </div>
  );
};