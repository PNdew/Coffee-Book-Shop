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
      console.log('Token:', token ? token.substring(0, 20) + '...' : 'null');
      
      const response = await axios.get(`${API_URL}/sach/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      console.log('Response status:', response.status);
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
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Headers:', error.response?.headers);
      }
      throw error;
    }
  },
  
  getBook: async (id: string) => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_URL}/sach/${id}/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin sách ${id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
      }
      throw error;
    }
  },
  
  addBook: async (bookData: BookInput) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_URL}/sach/`, bookData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Lấy thông báo lỗi từ response của backend
        const errorMessage = error.response?.data?.error || 'Không thể thêm sách';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },
  
  updateBook: async (id: string, bookData: Partial<BookInput>) => {
    try {
      const token = await getAuthToken();
      const response = await axios.put(`${API_URL}/sach/${id}/`, bookData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật sách ${id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
      }
      throw error;
    }
  },
  
  deleteBook: async (id: string) => {
    try {
      const token = await getAuthToken();
      await axios.delete(`${API_URL}/sach/${id}/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
    } catch (error) {
      console.error(`Lỗi khi xóa sách ${id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
      }
      throw error;
    }
  }
};

// Service cho thể loại
export const theLoaiService = {
  getAllTheLoai: async () => {
    try {
      console.log('Gọi API tại:', `${API_URL}/theloai/`);
      const token = await getAuthToken();
      const response = await axios.get(`${API_URL}/theloai/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
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
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
      }
      throw error;
    }
  },
  
  getTheLoai: async (id: string) => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_URL}/theloai/${id}/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin thể loại ${id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
      }
      throw error;
    }
  },
  
  addTheLoai: async (theLoaiData: { ten_the_loai: string }) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_URL}/theloai/`, theLoaiData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm thể loại:', error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
      }
      throw error;
    }
  }
};
