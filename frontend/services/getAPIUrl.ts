import { Platform } from 'react-native';

export function getApiUrl()  {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api';
  }
  return 'http://192.168.225.15:8000/api';
};

export const API_URL = getApiUrl();