import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from './getAPIUrl';
import { getAuthToken } from './authapi';

export const checkAttendance = async (
  employeeId: string, 
  latitude: number, 
  longitude: number
) => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(`${API_URL}/attendance/check/`, 
      {
        employee_id: employeeId,
        latitude,
        longitude
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error('Lỗi khi chấm công');
  }
};