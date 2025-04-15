import axios from 'axios';

// Sử dụng địa chỉ IP thực tế của bạn
export const API_URL = 'http://localhost:8000';

// Interface cho nguyên liệu
export interface Ingredient {
  id: string;
  ten_nguyen_lieu: string;
  so_luong: string;
  gia_nhap: number;
}

// Interface cho kết quả API trả về
interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ingredient[];
}

// Interface cho input khi thêm/sửa nguyên liệu
export interface IngredientInput {
  ten_nguyen_lieu: string;
  so_luong: string;
  gia_nhap: number;
}


// Service cho nguyên liệu
export const ingredientService = {
  getAllIngredients: async () => {
    try {
      console.log('Gọi API tại:', `${API_URL}/api/nguyenlieu/`);
      const response = await axios.get(`${API_URL}/api/nguyenlieu/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        }
      });
      console.log('Dữ liệu nhận được:', response.data);
      
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
      throw error;
    }
  },
  
  getIngredient: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/nguyenlieu/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
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
      const response = await axios.post(`${API_URL}/api/nguyenlieu/`, ingredientData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
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
      const response = await axios.put(`${API_URL}/api/nguyenlieu/${id}/`, ingredientData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
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
      await axios.delete(`${API_URL}/api/nguyenlieu/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
    } catch (error) {
      console.error(`Error deleting ingredient ${id}:`, error);
      throw error;
    }
  }
};
