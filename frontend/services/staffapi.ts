import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Sửa lại: Khai báo trực tiếp thay vì import từ file khác
export const API_URL = 'http://localhost:8000';

// Định nghĩa interface NhanVien khớp với backend
export interface NhanVien {
  IDNhanVien: number;
  TenNV: string;
  SDTNV: string;
  EmailNV?: string;
  CCCDNV: string;
  ChucVuNV: string; // Tương ứng với IDChucVu trong database
}

// Định nghĩa interface ChucVu khớp với backend
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
    console.log('Token:', token);
    
    let url = `${API_URL}/api/nhanvien/`;
    if (chucVu) {
      url += `?chuc_vu=${chucVu}`;
    }
    
    console.log('URL gọi API:', url);

    const response = await axios.get<NhanVien[]>(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Dữ liệu nhận được:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên:', error);
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
    console.log('Token cho chức vụ:', token);
    
    const response = await axios.get<ChucVu[]>(`${API_URL}/api/chucvu/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Dữ liệu chức vụ:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chức vụ:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    return [];
  }
};

// Interface cho đăng ký nhân viên
export interface RegisterStaffData {
  TenNV: string;
  SDTNV: string;
  EmailNV?: string;
  CCCDNV: string;
  ChucVuNV: string | number;
  MatKhau: string;
}

// API đăng ký nhân viên
export const registerStaff = async (staffData: RegisterStaffData): Promise<any> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error("Không có token, vui lòng đăng nhập lại");
    }
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await axios.post(`${API_URL}/api/staff/register/`, staffData, config);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi đăng ký nhân viên:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      throw error.response?.data || error.message;
    }
    throw error;
  }
};