import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SanphamAPI } from '@/types';
import { API_URL } from './getAPIUrl';
import { Platform } from 'react-native';

export const productService = {
  getAllProducts: async (): Promise<SanphamAPI[]> => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/sanpham/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sanpham:', error);
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

  createProduct: async (productData: any) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('tensp', productData.tensp);
      formData.append('giasp', productData.giasp.toString());
      formData.append('trangthaisp', productData.trangthaisp.toString());
      formData.append('loaisp', productData.loaisp);

      if (productData.image) {
        if (Platform.OS === 'web') {
          if (productData.image instanceof File) {
            formData.append('hinhanh', productData.image);
          } else {
            // Convert base64 to Blob for web
            const base64Data = productData.image.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteArrays = [];
            for (let i = 0; i < byteCharacters.length; i++) {
              byteArrays.push(byteCharacters.charCodeAt(i));
            }
            const blob = new Blob([new Uint8Array(byteArrays)], { type: 'image/jpeg' });
            formData.append('hinhanh', blob, 'image.jpg');
          }
        } else {
          // For mobile, fetch the image and convert to Blob
          const response = await fetch(productData.image);
          const blob = await response.blob();
          formData.append('hinhanh', blob, 'image.jpg');
        }
      }

      const formDataEntries = [];
      for (let pair of formData.entries()) {
        formDataEntries.push(pair);
      }
      console.log('FormData entries:', formDataEntries);

      const response = await axios.post(`${API_URL}/sanpham/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id: string, productData: any) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const formData = new FormData();
      formData.append('tensp', productData.tensp);
      formData.append('giasp', productData.giasp.toString());
      formData.append('trangthaisp', productData.trangthaisp.toString());
      formData.append('loaisp', productData.loaisp);

      if (productData.image) {
        if (Platform.OS === 'web') {
          // Trên web, chỉ chấp nhận File
          if (productData.image instanceof File) {
            formData.append('hinhanh', productData.image);
            console.log('Web: Thêm File:', productData.image.name);
          } else {
            console.warn('Web: Định dạng ảnh không hợp lệ, cần File, nhận:', productData.image);
            throw new Error('Định dạng ảnh không hợp lệ trên web; vui lòng tải lên file.');
          }
        } else {
          // Trên mobile, xử lý URI từ react-native-image-picker
          const uri = productData.image;
          if (!uri || typeof uri !== 'string' || uri.startsWith('data:image')) {
            console.warn('Mobile: URI ảnh không hợp lệ:', uri);
            throw new Error('URI ảnh không hợp lệ trên mobile; vui lòng chọn ảnh hợp lệ.');
          }
          const filename = uri.split('/').pop() || 'photo.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          // TypeScript: Định kiểu rõ ràng cho FormData value
          formData.append('hinhanh', {
            uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri, // Xử lý URI trên iOS
            name: filename,
            type
          } as any); // Sử dụng 'as any' tạm thời để vượt qua kiểm tra TypeScript
          console.log('Mobile: Thêm ảnh:', { uri, name: filename, type });
        }
      }

      // Debug FormData
      const formDataEntries = [];
      for (let pair of formData.entries()) {
        formDataEntries.push([pair[0], typeof pair[1] === 'object' ? 'File/URI' : pair[1]]);
      }
      console.log('FormData entries:', formDataEntries);

      const response = await axios.patch(`${API_URL}/sanpham/${id}/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
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
