import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Sử dụng địa chỉ IP thực tế của bạn
export const API_URL = 'http://localhost:8000';

// Interface cho dòng hóa đơn
export interface DongHoaDon {
  so_tt_dong: number;
  idsanpham: number;
  soluongsp: number;
  ghichu?: string;
  idvoucher?: number;
  sanpham_info: {
    idsanpham: number;
    tensp: string;
    giasp: number;
    loaisp: string;
  };
  voucher_info?: {
    idvoucher: number;
    loaisp: string;
    thoigianbatdauvoucher: string;
    thoigianketthucvoucher: string;
    giamgia: number;
  };
}

// Interface cho hóa đơn
export interface HoaDon {
  idhoadon: number;
  ngayhd: string;
  idnhanvien: number;
  donghoadon: DongHoaDon[];
}

// Hàm lấy token xác thực từ localStorage hoặc SecureStore
const getAuthToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('access_token');
    } else {
      return await SecureStore.getItemAsync('access_token');
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Service cho hóa đơn
export const billService = {
  getAllHoaDon: async () => {
    try {
      console.log('Gọi API tại:', `${API_URL}/api/hoadon/`);
      const token = await getAuthToken();
      const response = await axios.get(`${API_URL}/api/hoadon/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '', 
        }
      });
      console.log('Dữ liệu hóa đơn nhận được:', response.data);
      
      // Xử lý cả hai trường hợp: có phân trang và không phân trang
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.results) {
        return response.data.results;
      }
      
      console.warn('Định dạng dữ liệu không xác định:', response.data);
      return [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách hóa đơn:', error);
      throw error;
    }
  },
  
  getHoaDon: async (id: string) => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_URL}/api/hoadon/${id}/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '', 
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin hóa đơn ${id}:`, error);
      throw error;
    }
  },
  
  getDongHoaDon: async (hoaDonId: string) => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_URL}/api/hoadon/${hoaDonId}/dong_hoa_don/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '', 
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách dòng hóa đơn cho hóa đơn ${hoaDonId}:`, error);
      throw error;
    }
  },
  
  deleteHoaDon: async (id: string) => {
    try {
      const token = await getAuthToken();
      await axios.delete(`${API_URL}/api/hoadon/${id}/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '', 
        }
      });
    } catch (error) {
      console.error(`Lỗi khi xóa hóa đơn ${id}:`, error);
      throw error;
    }
  },
  
  insertTestData: async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_URL}/api/hoadon/insert_test_data/`, {}, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '', 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm dữ liệu mẫu hóa đơn:', error);
      throw error;
    }
  }
};
