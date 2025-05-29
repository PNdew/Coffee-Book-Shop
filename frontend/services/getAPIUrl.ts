import { Platform } from 'react-native';

/**
 * Hàm trả về URL API phù hợp theo nền tảng chạy app (Web, Android, iOS)
 */
export function getApiUrl(): string {
  if (Platform.OS === 'web') {
    // 👉 Khi chạy trên Web (localhost:3000), server backend cũng trên localhost
    return 'http://localhost:8000/api';
  }

  // 👉 Khi chạy trên Mobile (Android Emulator, real device)
  // Thay '192.168.1.3' bằng IP máy tính của bạn trong mạng LAN
  return 'http://192.168.1.3:8000/api';
}

// 👉 Giá trị mặc định API_URL cho toàn bộ app
export const API_URL = getApiUrl();
