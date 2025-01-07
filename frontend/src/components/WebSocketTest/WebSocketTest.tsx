import React from 'react';
import { WebSocketEvents } from '../../types/websocket.types';
import styles from './WebSocketTest.module.css';

type EventNames = keyof WebSocketEvents;

interface WebSocketTestProps {
  socket: {
    emit: <T extends EventNames>(event: T, data: WebSocketEvents[T]) => void;
  };
  connected: boolean;
  messages: string[];
  setMessages: React.Dispatch<React.SetStateAction<string[]>>;
}

export const WebSocketTest: React.FC<WebSocketTestProps> = ({ 
  socket, 
  connected, 
  messages, 
  setMessages 
}) => {
  // Функція для тестування join_room
  const handleJoinRoom = () => {
    console.log('Joining room');
    const data = { room: 'test-room' };
    console.log('Sending join_room event with data:', data);
    socket.emit('join_room', data);  
    setMessages(prev => [...prev, 'Sent join_room event']);
  };

  // Функція для тестування face_data
  const handleSendFaceData = () => {
    const testData: WebSocketEvents['face_data'] = {
      roomId: 'test-room',
      faceData: {
        landmarks: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 100 }
          ]
        },
        expressions: {
          happy: 0.8,
          sad: 0.1,
          angry: 0.1
        }
      }
    };
    console.log('Sending face_data event with data:', testData);
    socket.emit('face_data', testData);
    setMessages(prev => [...prev, 'Sent face_data event']);
  };

  return (
    <div className={styles.websocketSection}>
      <h1>WebSocket Test</h1>
      <div className={styles.status}>
        Status: <span style={{ color: connected ? '#4CAF50' : '#f44336' }}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <div className={styles.controls}>
        <button 
          onClick={handleJoinRoom}
          disabled={!connected}
        >
          Join Room
        </button>
        <button 
          onClick={handleSendFaceData}
          disabled={!connected}
        >
          Send Face Data
        </button>
      </div>
      <div className={styles.log}>
        <h3>Events Log:</h3>
        <div className={styles.logContent}>
          {messages.map((msg, idx) => (
            <div key={idx} className={styles.logMessage}>
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
