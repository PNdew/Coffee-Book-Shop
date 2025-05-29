import axios from 'axios';
import { API_URL } from './getAPIUrl';
import { getAuthToken } from './authapi';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { Platform } from 'react-native';

interface AttendanceResponse {
  success: boolean;
  message?: string;
  distance?: number;
  is_late?: boolean;
  is_checked_in?: boolean;
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

export const checkAttendance = async (
  employeeId: string,
  latitude: number,
  longitude: number
): Promise<AttendanceResponse> => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      `${API_URL}/attendance/check-in/`,
      {
        employeeId,
        latitude,
        longitude
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      message: response.data.message,
      distance: response.data.distance,
      is_late: response.data.is_late
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể kết nối đến máy chủ'
    };
  }
};

export const getAttendanceStatus = async (): Promise<AttendanceResponse> => {
  try {
    console.log('Đang lấy trạng thái chấm công...');
    let token;
    console.log('Platform:', Platform.OS);
    // Check if running on web or mobile
    if (Platform.OS === 'web') {
      
      token = window.localStorage.getItem('access_token');
    } else {
      token= await SecureStore.getItemAsync('access_token');
    }
    console.log('Token:', token);
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_URL}/attendance/status/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      is_checked_in: response.data.is_checked_in,
      checkInTime: response.data.checkInTime,
      checkOutTime: response.data.checkOutTime,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      is_checked_in: false,
      checkInTime: null,
      checkOutTime: null,
      message: error.response?.data?.message || 'Failed to fetch attendance status'
    };
  }
};
