import axios from 'axios';
import { BookInput } from '@/types'
import { API_URL } from './getAPIUrl';
import { getAuthToken } from './authapi';

// Thêm service cho sách
export const bookService = {
  getAllBooks: async () => {
    try {
      console.log('Gọi API tại:', `${API_URL}/sach/`);
      const token = await getAuthToken();
      const response = await axios.get(`${API_URL}/sach/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '', 
        }
      });
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
      const response = await axios.get(`${API_URL}/sach/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin sách ${id}:`, error);
      throw error;
    }
  },
  
  addBook: async (bookData: BookInput) => {
    try {
      const response = await axios.post(`${API_URL}/sach/`, bookData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm sách:', error);
      throw error;
    }
  },
  
  updateBook: async (id: string, bookData: Partial<BookInput>) => {
    try {
      const response = await axios.put(`${API_URL}/sach/${id}/`, bookData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật sách ${id}:`, error);
      throw error;
    }
  },
  
  deleteBook: async (id: string) => {
    try {
      await axios.delete(`${API_URL}/sach/${id}/`);
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
      console.log('Gọi API tại:', `${API_URL}/theloai/`);
      const response = await axios.get(`${API_URL}/theloai/`);
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
      const response = await axios.get(`${API_URL}/theloai/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin thể loại ${id}:`, error);
      throw error;
    }
  },
  
  addTheLoai: async (theLoaiData: { ten_the_loai: string }) => {
    try {
      const response = await axios.post(`${API_URL}/theloai/`, theLoaiData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm thể loại:', error);
      throw error;
    }
  }
};
