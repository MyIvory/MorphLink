import React, { useCallback, useEffect, useState, useRef } from "react";
import { FaceTracking } from "../../components/FaceTracking/FaceTracking";
import { FaceMask } from "../../components/FaceMask/FaceMask";
import { useWebSocket } from "../../hooks/useWebSocket";
import { FaceDataEvent } from "../../types/websocket.types";
import styles from "./Home.module.css";

// Використовуємо WebSocket URL з env змінної або за замовчуванням
const WEBSOCKET_URL =
  import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:3000";
const ROOM_ID = import.meta.env.ROOM_ID || "test-room";

export const Home: React.FC = () => {
  const { emit, on, off, connected, wsService } = useWebSocket(WEBSOCKET_URL);
  const [stream, setStream] = useState<MediaStream>();
  const [receivedFaceData, setReceivedFaceData] = useState<
    FaceDataEvent["faceData"] | null
  >(null);
  const isJoinedRoomRef = useRef(false);

  // Підписуємось на події та приєднуємось до кімнати
  useEffect(() => {
    if (!connected) return;

    console.log("[Home] Setting up event handlers");

    const handleJoined = (data: { room: string }) => {
      console.log("[Home] Joined room:", data.room);
      isJoinedRoomRef.current = true;
    };

    const handleFaceData = (data: FaceDataEvent) => {
      //  console.log('[Home] Received face data from room:', data.roomId);
      setReceivedFaceData(data.faceData);
    };

    // Підписуємось на події
    on("joined", handleJoined);
    on("face_data", handleFaceData);

    // Приєднуємось до кімнати, якщо ще не приєднані
    if (!isJoinedRoomRef.current) {
      console.log("[Home] Connected and not joined, joining room:", ROOM_ID);
      emit("join_room", { room: ROOM_ID });
    }

    return () => {
      console.log("[Home] Cleaning up event handlers");
      off("joined", handleJoined);
      off("face_data", handleFaceData);
    };
  }, [connected, on, off, emit]);

  // Отримуємо доступ до камери
  useEffect(() => {
    console.log("[Home] Requesting camera access...");

    // Перевіряємо чи є доступ до mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("[Home] getUserMedia is not supported");
      return;
    }

    // Спробуємо отримати список доступних камер
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        console.log("[Home] Available video devices:", videoDevices);
      })
      .catch((error) => {
        console.error("[Home] Error enumerating devices:", error);
      });

    // Запитуємо доступ до камери
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })
      .then((stream) => {
        console.log("[Home] Camera access granted");
        console.log("[Home] Stream tracks:", stream.getTracks());
        setStream(stream);
      })
      .catch((error) => {
        console.error("[Home] Camera access error:", error);
        console.error("[Home] Error name:", error.name);
        console.error("[Home] Error message:", error.message);
      });

    return () => {
      if (stream) {
        console.log("[Home] Stopping camera stream");
        stream.getTracks().forEach((track) => {
          console.log("[Home] Stopping track:", track);
          track.stop();
        });
      }
    };
  }, []);

  const handleFaceData = useCallback(
    (faceData: FaceDataEvent["faceData"]) => {
      if (!wsService?.getConnectionStatus()) {
        console.warn("[Home] WebSocket not connected, skipping face data");
        return;
      }

      if (!isJoinedRoomRef.current) {
        console.warn("[Home] Not joined to room yet, skipping face data");
        return;
      }

      // console.log('[Home] Sending face data to room:', ROOM_ID);
      emit("face_data", {
        roomId: ROOM_ID,
        faceData,
      });
    },
    [emit, wsService]
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>MorphLink</h1>

      <div className={styles.videoContainer}>
        <FaceTracking stream={stream} onFaceData={handleFaceData} />
      </div>
      <div className={styles.maskContainer}>
        <FaceMask faceData={receivedFaceData} />
      </div>
      <div className={styles.status}>
        WebSocket: {connected ? "Connected" : "Disconnected"} ({WEBSOCKET_URL})
        {connected &&
          (isJoinedRoomRef.current
            ? ` | Joined Room: ${ROOM_ID}`
            : " | Not Joined Room")}
      </div>
    </div>
  );
};
