import React, { useCallback, useEffect, useState, useRef } from "react";
import { FaceTracking } from "../../components/FaceTracking/FaceTracking";
import { FaceMask } from "../../components/FaceMask/FaceMask";
import { useWebSocket } from "../../hooks/useWebSocket";
import { FaceDataEvent } from "../../types/websocket.types";
import styles from "./Home.module.css";

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:3000";
const ROOM_ID = import.meta.env.ROOM_ID || "test-room";

export const Home: React.FC = () => {
  const { emit, on, off, connected, connect, disconnect } = useWebSocket(WEBSOCKET_URL);
  const [stream, setStream] = useState<MediaStream>();
  const [receivedFaceData, setReceivedFaceData] = useState<FaceDataEvent["faceData"] | null>(null);
  const isJoinedRoomRef = useRef(false);
  const [isTransmitting, setIsTransmitting] = useState(false);

  // Підключаємо камеру при старті
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })
      .then(setStream)
      .catch(console.error);

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Обробляємо WebSocket події
  useEffect(() => {
    if (!connected || !isTransmitting) return;

    const handleJoined = (data: { room: string }) => {
      isJoinedRoomRef.current = true;
    };

    const handleFaceData = (data: FaceDataEvent) => {
      setReceivedFaceData(data.faceData);
    };

    on("joined", handleJoined);
    on("face_data", handleFaceData);
    emit("join_room", { room: ROOM_ID });

    return () => {
      off("joined", handleJoined);
      off("face_data", handleFaceData);
      setReceivedFaceData(null);
      isJoinedRoomRef.current = false;
    };
  }, [connected, on, off, emit, isTransmitting]);

  // Відправляємо дані обличчя
  const handleFaceData = useCallback((faceData: FaceDataEvent["faceData"]) => {
    if (!connected || !isTransmitting || !isJoinedRoomRef.current) return;

    emit("face_data", {
      roomId: ROOM_ID,
      faceData,
    });
  }, [emit, connected, isTransmitting]);

  // Перемикаємо передачу даних
  const toggleTransmission = useCallback(() => {
    if (isTransmitting) {
      disconnect();
      setIsTransmitting(false);
    } else {
      connect();
      setIsTransmitting(true);
    }
  }, [isTransmitting, connect, disconnect]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>MorphLink</h1>

      <div className={styles.controls}>
        <button className={styles.button} onClick={toggleTransmission}>
          {isTransmitting ? "Stop Transmission" : "Start Transmission"}
        </button>
      </div>

      <div className={styles.videoContainer}>
        <FaceTracking stream={stream} onFaceData={handleFaceData} />
      </div>
      <div className={styles.maskContainer}>
        <FaceMask faceData={receivedFaceData} />
      </div>

      <div className={styles.status}>
        WebSocket: {connected ? "Connected" : "Disconnected"} ({WEBSOCKET_URL})
        {connected && isJoinedRoomRef.current && ` | Room: ${ROOM_ID}`}
      </div>
    </div>
  );
};
