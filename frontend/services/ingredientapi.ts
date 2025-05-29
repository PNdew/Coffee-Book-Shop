import axios from 'axios';
import { API_URL } from './getAPIUrl';
import { getAuthToken } from './authapi';

// Interface cho nguyên liệu
export interface Ingredient {
  id: number;
  ten_nguyen_lieu: string;
  so_luong: string;
  don_vi: string;
  gia_nhap?: number;
}

// Interface cho kết quả API trả về
interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ingredient[];
}

// Interface cho đầu vào khi tạo nguyên liệu mới
export interface IngredientInput {
  ten_nguyen_lieu: string;
  so_luong: string;
  don_vi: string;
  gia_nhap: number;
}


// Service cho nguyên liệu
export const ingredientService = {
  getAllIngredients: async () => {
    try {
      console.log('Gọi API tại:', `${API_URL}/nguyenlieu/`);
      const token = await getAuthToken();
      console.log('Token:', token ? token.substring(0, 20) + '...' : 'null');
      
      const response = await axios.get(`${API_URL}/nguyenlieu/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      // Xử lý cả hai trường hợp:
      // 1. Nếu dữ liệu là mảng (không có phân trang): trả về trực tiếp
      // 2. Nếu dữ liệu là object có thuộc tính results (có phân trang): trả về results
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.results) {
        return response.data.results;
      }
      
      // Trường hợp khác (không mong đợi)
      console.warn('Định dạng dữ liệu không xác định:', response.data);
      return [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nguyên liệu:', error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Headers:', error.response?.headers);
      }
      throw error;
    }
  },
  
  getIngredient: async (id: string) => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_URL}/nguyenlieu/${id}/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ingredient ${id}:`, error);
      throw error;
    }
  },
  
  addIngredient: async (ingredientData: IngredientInput) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_URL}/nguyenlieu/`, ingredientData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding ingredient:', error);
      throw error;
    }
  },
  
  updateIngredient: async (id: string, ingredientData: Partial<Ingredient>) => {
    try {
      const token = await getAuthToken();
      const response = await axios.put(`${API_URL}/nguyenlieu/${id}/`, ingredientData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating ingredient ${id}:`, error);
      throw error;
    }
  },
  
  deleteIngredient: async (id: string) => {
    try {
      const token = await getAuthToken();
      await axios.delete(`${API_URL}/nguyenlieu/${id}/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
    } catch (error) {
      console.error(`Error deleting ingredient ${id}:`, error);
      throw error;
    }
  }
};
