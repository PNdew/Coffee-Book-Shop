import axios, { AxiosError } from 'axios';
import { VoucherInput } from '@/types'
import { API_URL } from './getAPIUrl';
import { getAuthToken } from './authapi';

// Thêm service cho sách
export const voucherService = {
  getAllVouchers: async () => {
    try {
      console.log('Gọi API tại:', `${API_URL}/voucher/`);
      const token = await getAuthToken();
      const response = await axios.get(`${API_URL}/voucher/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '', 
        }
      });
      console.log('Dữ liệu voucher nhận được:', response.data);
      
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
  
  getVoucher: async (id: string) => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_URL}/voucher/${id}/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      return response.data
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin voucher ${id}:`, error);
      throw error;
    }
  },
  
  addVoucher: async (voucherData: VoucherInput) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_URL}/voucher/`, voucherData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm voucher:', error);
      throw error;
    }
  },
  
  updateVoucher: async (id: string, voucherData: Partial<VoucherInput>) => {
    try {
      const token = await getAuthToken();
      const response = await axios.put(`${API_URL}/voucher/${id}/`, voucherData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(`Lỗi khi cập nhật voucher ${id}:`, error.response?.data);
      } else {
        console.error(`Lỗi khi cập nhật voucher ${id}:`, error);
      }
      throw error;
    }
  },
  
  deleteVoucher: async (id: string) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${API_URL}/voucher/${id}/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
    } catch (error) {
      console.error(`Lỗi khi xóa voucher ${id}:`, error);
      throw error;
    }
  }
};
