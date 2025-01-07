import { FaceMask } from './face-mask.type';

// Вхідне повідомлення від клієнта
export interface FaceDataMessage {
  room: string;          // ID кімнати
  mask: FaceMask;       // Дані маски
}

// Вихідне повідомлення для інших клієнтів
export interface FaceDataResponse {
  from: string;         // ID відправника
  mask: FaceMask;      // Дані маски
  timestamp: number;    // Час отримання
}

// Повідомлення про помилку
export interface ErrorResponse {
  error: string;        // Текст помилки
  code?: number;        // Код помилки (опціонально)
}
