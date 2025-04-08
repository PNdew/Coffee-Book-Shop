import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:8000';

export const checkAttendance = async (
  employeeId: string, 
  latitude: number, 
  longitude: number
) => {
  try {
    const response = await axios.post(`${API_URL}/attendance/check/`, {
      employee_id: employeeId,
      latitude,
      longitude
    });
    return response.data;
  } catch (error) {
    throw new Error('Lỗi khi chấm công');
  }
}