import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SanphamAPI } from '@/types';
import { API_URL } from './getAPIUrl';

export const productService = {
  getAllProducts: async (): Promise<SanphamAPI[]> => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/sanpham/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getProductById: async (id: string): Promise<SanphamAPI> => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/sanpham/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  },

  createProduct: async (product: Partial<SanphamAPI>): Promise<SanphamAPI> => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.post(`${API_URL}/sanpham/`, product, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id: string, product: Partial<SanphamAPI>): Promise<SanphamAPI> => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.put(`${API_URL}/sanpham/${id}/`, product, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw error;
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      await axios.delete(`${API_URL}/sanpham/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  }
};
