import React, { useRef, useEffect } from 'react';
import styles from './VideoStream.module.css';

interface VideoStreamProps {
  stream?: MediaStream;
  autoPlay?: boolean;
  muted?: boolean;
}

export const VideoStream: React.FC<VideoStreamProps> = ({ 
  stream, 
  autoPlay = true, 
  muted = true 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={styles.videoContainer}>
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        muted={muted}
        className={styles.video}
      />
    </div>
  );
};
