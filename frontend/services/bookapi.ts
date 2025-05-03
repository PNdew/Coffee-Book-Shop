import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Sử dụng địa chỉ IP thực tế của bạn
export const API_URL = 'http://localhost:8000';

export interface TheLoai {
  id: number;
  ten_the_loai: string;
}

export interface Book {
  id: number;
  ten_sach: string;
  tac_gia: string;
  so_luong_sach: number
  trang_thai: string;
  the_loai_list?: TheLoai[];
}

export interface BookInput {
  ten_sach: string;
  tac_gia: string;
  so_luong_sach: number;
  trang_thai?: string;
  the_loai_ids?: number[];
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

// Thêm service cho sách
export const bookService = {
  getAllBooks: async () => {
    try {
      console.log('Gọi API tại:', `${API_URL}/api/books/sach/`);
      const response = await axios.get(`${API_URL}/api/books/sach/`);
      console.log('Dữ liệu sách nhận được:', response.data);
      
      // Xử lý cả hai trường hợp: có phân trang và không phân trang
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.results) {
        return response.data.results;
      }
      
      console.warn('Định dạng dữ liệu không xác định:', response.data);
      return [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sách:', error);
      throw error;
    }
  },
  
  getBook: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/books/sach/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin sách ${id}:`, error);
      throw error;
    }
  },
  
  addBook: async (bookData: BookInput) => {
    try {
      const response = await axios.post(`${API_URL}/api/books/sach/`, bookData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm sách:', error);
      throw error;
    }
  },
  
  updateBook: async (id: string, bookData: Partial<BookInput>) => {
    try {
      const response = await axios.put(`${API_URL}/api/books/sach/${id}/`, bookData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật sách ${id}:`, error);
      throw error;
    }
  },
  
  deleteBook: async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/books/sach/${id}/`);
    } catch (error) {
      console.error(`Lỗi khi xóa sách ${id}:`, error);
      throw error;
    }
  }
};

// Service cho thể loại
export const theLoaiService = {
  getAllTheLoai: async () => {
    try {
      console.log('Gọi API tại:', `${API_URL}/api/books/theloai/`);
      const response = await axios.get(`${API_URL}/api/books/theloai/`);
      console.log('Dữ liệu thể loại nhận được:', response.data);
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.results) {
        return response.data.results;
      }
      
      console.warn('Định dạng dữ liệu không xác định:', response.data);
      return [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thể loại:', error);
      throw error;
    }
  },
  
  getTheLoai: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/books/theloai/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin thể loại ${id}:`, error);
      throw error;
    }
  },
  
  addTheLoai: async (theLoaiData: { ten_the_loai: string }) => {
    try {
      const response = await axios.post(`${API_URL}/api/books/theloai/`, theLoaiData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm thể loại:', error);
      throw error;
    }
  }
};
