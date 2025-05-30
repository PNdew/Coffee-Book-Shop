import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { getUserFromToken } from './authapi';
import { checkPermissionAPI } from './checkpermissionapi';

export const DEFAULT_LOCATION = {
  OFFICE_LAT: 10.762622,
  OFFICE_LNG: 106.660172,
  MAX_DISTANCE: 100 // meters
};
interface Coordinates {
  latitude: number;
  longitude: number;
  isDefaultLocation?: boolean;
}

export const getCurrentLocation = async (): Promise<Coordinates> => {
  try {
    // Kiểm tra quyền user
    const user = await getUserFromToken();
    const canAccessLocation = await checkPermissionAPI(user?.ChucVuNV || 2, 'location.access');

    // Nếu không có quyền, trả về vị trí mặc định
    if (!canAccessLocation) {
      return {
        latitude: DEFAULT_LOCATION.OFFICE_LAT,
        longitude: DEFAULT_LOCATION.OFFICE_LNG,
        isDefaultLocation: true,
      };
    }

    console.log('Đang lấy vị trí hiện tại...');
    if (Platform.OS === 'web') {
      // Dùng Geolocation cho web
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Trình duyệt không hỗ trợ định vị'));
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            reject(new Error('Không thể lấy vị trí: ' + error.message));
          },
          { enableHighAccuracy: true }
        );
      });
    } else {
      // Dùng Expo Location cho mobile
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Quyền truy cập vị trí bị từ chối');
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        console.log('Vị trí hiện tại:', location.coords);
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      } catch (error) {
        console.error('Lỗi lấy vị trí:', error);
        throw new Error('Không thể lấy vị trí hiện tại');
      }
    }
  } catch (error) {
    console.error('Lỗi lấy vị trí:', error);
    // Trả về vị trí mặc định nếu có lỗi
    return {
      latitude: DEFAULT_LOCATION.OFFICE_LAT,
      longitude: DEFAULT_LOCATION.OFFICE_LNG,
      isDefaultLocation: true,
    };
  }
};
