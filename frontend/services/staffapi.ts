import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Sử dụng địa chỉ API_URL từ file khác
import { API_URL } from './bookapi';

// Interface cho nhân viên
export interface NhanVien {
  IDNhanVien: number;
  TenNV: string;
  SDTNV: string;
  EmailNV?: string;
  CCCDNV: string;
  ChucVuNV: string;
  ten_chuc_vu?: string;
}

// Interface cho chức vụ
export interface ChucVu {
  idchucvu: number;
  loaichucvu: string;
}

// Hàm lấy token từ storage
const getToken = async (): Promise<string | null> => {
  try {
    let token;
    if (Platform.OS === 'web') {
      token = localStorage.getItem('access_token');
    } else {
      token = await SecureStore.getItemAsync('access_token');
    }
    return token;
  } catch (error) {
    console.error('Lỗi khi lấy token:', error);
    return null;
  }
};

// Hàm lấy danh sách nhân viên
export const getNhanVien = async (chucVu?: string): Promise<NhanVien[]> => {
  try {
    const token = await getToken();
    console.log('Token:', token); // Debug: Ghi log token
    
    let url = `${API_URL}/api/nhanvien/`;
    if (chucVu) {
      url += `?chuc_vu=${chucVu}`;
    }
    
    console.log('URL gọi API:', url); // Debug: Ghi log URL

    // Tạm thời bỏ qua xác thực token để kiểm tra lỗi
    const response = await axios.get<NhanVien[]>(url);
    console.log('Dữ liệu nhận được:', response.data); // Debug: Ghi log dữ liệu trả về
    
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên:', error);
    // Debug: Ghi log chi tiết lỗi
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    return [];
  }
};

// Hàm lấy danh sách chức vụ
export const getChucVu = async (): Promise<ChucVu[]> => {
  try {
    const token = await getToken();
    console.log('Token cho chức vụ:', token); // Debug: Ghi log token
    
    // Tạm thời bỏ qua xác thực token để kiểm tra lỗi
    const response = await axios.get<ChucVu[]>(`${API_URL}/api/chucvu/`);
    console.log('Dữ liệu chức vụ:', response.data); // Debug: Ghi log dữ liệu trả về
    
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chức vụ:', error);
    // Debug: Ghi log chi tiết lỗi
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    return [];
  }
}; 