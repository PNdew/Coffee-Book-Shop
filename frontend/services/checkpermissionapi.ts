import axios from 'axios';
import { getAuthToken } from './authapi';
// Sử dụng địa chỉ API_URL từ file khác
import { API_URL } from './getAPIUrl';

// Kiểm tra quyền từ API
export const checkPermissionAPI = async (chucVu: number, chucNang: string): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return false;
    }

    const response = await axios.post(
      `${API_URL}/checkpermission/`,
      {
        chuc_vu: chucVu,
        chuc_nang: chucNang
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.access === true;
  } catch (error) {
    console.error('Lỗi khi kiểm tra quyền:', error);
    return false;
  }
};
