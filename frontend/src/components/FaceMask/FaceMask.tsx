import React, { useEffect, useRef, useState } from 'react';
import { FaceDataEvent } from '../../types/websocket.types';
import styles from './FaceMask.module.css';

interface FaceMaskProps {
  faceData: FaceDataEvent['faceData'] | null;
}

export const FaceMask: React.FC<FaceMaskProps> = ({ faceData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [baseImage] = useState<HTMLImageElement>(() => {
    const img = new Image();
    img.src = '/face.png';
    img.onload = () => {
      console.log('Face image loaded', { width: img.width, height: img.height });
    };
    img.onerror = (e) => console.error('Error loading face image:', e);
    return img;
  });

  useEffect(() => {
    if (!canvasRef.current || !baseImage.complete || !faceData?.landmarks) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаємо canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const points = faceData.landmarks.points;
    
    // Знаходимо центр обличчя по ключовим точкам
    const noseBridge = points.slice(27, 36);
    const noseX = noseBridge.reduce((sum, p) => sum + p.x, 0) / noseBridge.length;
    const noseY = noseBridge.reduce((sum, p) => sum + p.y, 0) / noseBridge.length;

    console.log('Face center:', { noseX, noseY });
    
    // Знаходимо розміри обличчя
    const facePoints = points.slice(0, 17); // Контур обличчя
    const videoFaceLeft = Math.min(...facePoints.map(p => p.x));
    const videoFaceRight = Math.max(...facePoints.map(p => p.x));
    const videoFaceTop = Math.min(...points.slice(21, 27).map(p => p.y)); // Брови
    const videoFaceBottom = Math.max(...points.slice(48, 68).map(p => p.y)); // Рот
    
    const videoFaceWidth = videoFaceRight - videoFaceLeft;
    const videoFaceHeight = videoFaceBottom - videoFaceTop;

    console.log('Face dimensions:', {
      width: videoFaceWidth,
      height: videoFaceHeight,
      top: videoFaceTop,
      bottom: videoFaceBottom,
      left: videoFaceLeft,
      right: videoFaceRight
    });

    // Знаходимо співвідношення сторін фото
    const imageAspectRatio = baseImage.width / baseImage.height;
    
    // Визначаємо максимальний розмір фото відносно canvas
    const maxWidth = canvas.width * 0.5; // Максимум 50% від ширини canvas
    const maxHeight = canvas.height * 0.5; // Максимум 50% від висоти canvas
    
    // Визначаємо розмір для фото, зберігаючи пропорції та обмежуючи розміром canvas
    let targetWidth = videoFaceWidth * 1.2; // Множник 1.2 для невеликого відступу
    let targetHeight = targetWidth / imageAspectRatio;

    // Якщо розмір перевищує максимальний - зменшуємо
    if (targetWidth > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = targetWidth / imageAspectRatio;
    }
    if (targetHeight > maxHeight) {
      targetHeight = maxHeight;
      targetWidth = targetHeight * imageAspectRatio;
    }

    // Позиціонуємо фото відносно носа, з обмеженням по краях canvas
    let x = noseX - targetWidth / 2;
    let y = noseY - targetHeight * 0.55;

    // Обмежуємо позицію щоб фото не виходило за межі canvas
    x = Math.max(0, Math.min(x, canvas.width - targetWidth));
    y = Math.max(0, Math.min(y, canvas.height - targetHeight));

    console.log('Image position:', { x, y, width: targetWidth, height: targetHeight });

    // Малюємо базове зображення
    ctx.save();
    ctx.drawImage(baseImage, x, y, targetWidth, targetHeight);

    if (faceData.expressions) {
      const { happy, sad, angry } = faceData.expressions;
      
      // Створюємо тимчасовий canvas для деформацій
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // Копіюємо поточне зображення
      tempCtx.drawImage(canvas, 0, 0);

      // Функція для деформації області
      const deformRegion = (centerX: number, centerY: number, radius: number, intensity: number) => {
        const imageData = tempCtx.getImageData(
          Math.max(0, centerX - radius),
          Math.max(0, centerY - radius),
          Math.min(radius * 2, canvas.width - centerX + radius),
          Math.min(radius * 2, canvas.height - centerY + radius)
        );
        const pixels = imageData.data;
        
        for (let y = 0; y < imageData.height; y++) {
          for (let x = 0; x < imageData.width; x++) {
            const absX = x + Math.max(0, centerX - radius);
            const absY = y + Math.max(0, centerY - radius);
            
            const dx = absX - centerX;
            const dy = absY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius) {
              const factor = Math.pow(1 - distance / radius, 2) * intensity;
              const srcX = Math.floor(absX + dx * factor);
              const srcY = Math.floor(absY + dy * factor);
              
              if (srcX >= 0 && srcX < canvas.width && srcY >= 0 && srcY < canvas.height) {
                const dstIndex = (y * imageData.width + x) * 4;
                const srcIndex = ((srcY - Math.max(0, centerY - radius)) * imageData.width + 
                                (srcX - Math.max(0, centerX - radius))) * 4;
                
                if (srcIndex >= 0 && srcIndex < pixels.length - 3) {
                  pixels[dstIndex] = pixels[srcIndex];
                  pixels[dstIndex + 1] = pixels[srcIndex + 1];
                  pixels[dstIndex + 2] = pixels[srcIndex + 2];
                  pixels[dstIndex + 3] = pixels[srcIndex + 3];
                }
              }
            }
          }
        }
        
        tempCtx.putImageData(
          imageData,
          Math.max(0, centerX - radius),
          Math.max(0, centerY - radius)
        );
      };

      // Застосовуємо деформації для емоцій
      if (happy > 0.5) {
        // Підняти куточки губ
        const mouthLeft = points[48];
        const mouthRight = points[54];
        deformRegion(mouthLeft.x, mouthLeft.y, videoFaceWidth * 0.15, happy * 0.3);
        deformRegion(mouthRight.x, mouthRight.y, videoFaceWidth * 0.15, happy * 0.3);
      }
      
      if (sad > 0.5) {
        // Опустити куточки губ
        const mouthLeft = points[48];
        const mouthRight = points[54];
        deformRegion(mouthLeft.x, mouthLeft.y, videoFaceWidth * 0.15, -sad * 0.3);
        deformRegion(mouthRight.x, mouthRight.y, videoFaceWidth * 0.15, -sad * 0.3);
      }
      
      if (angry > 0.5) {
        // Звести брови
        const leftBrow = points[21];
        const rightBrow = points[22];
        deformRegion(leftBrow.x, leftBrow.y, videoFaceWidth * 0.1, angry * 0.4);
        deformRegion(rightBrow.x, rightBrow.y, videoFaceWidth * 0.1, angry * 0.4);
      }

      // Копіюємо результат назад
      ctx.drawImage(tempCanvas, 0, 0);
    }

    ctx.restore();
  }, [faceData, baseImage]);

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={640}
        height={480}
      />
    </div>
  );
};