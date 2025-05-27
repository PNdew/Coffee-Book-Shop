import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

// Sử dụng địa chỉ API_URL từ file khác
import { API_URL } from './bookapi';

export interface UserInfo {
  SDTNV: string;
  TenNV: string;
  ChucVuNV: number; // 1: Quản lý, 2: Nhân viên
  exp?: number;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface Permissions {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

// Lấy thông tin người dùng từ token
export const getUserFromToken = async (): Promise<UserInfo | null> => {
  try {
    let token;
    if (Platform.OS === 'web') {
      token = localStorage.getItem('access_token');
    } else {
      token = await SecureStore.getItemAsync('access_token');
    }

    if (!token) {
      return null;
    }

    const decoded = jwtDecode<UserInfo>(token);
    
    // Kiểm tra token hết hạn
    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded.exp < currentTime) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Lỗi khi giải mã token:', error);
    return null;
  }
};

// Lấy token xác thực
export const getAuthToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('access_token');
    } else {
      return await SecureStore.getItemAsync('access_token');
    }
  } catch (error) {
    console.error('Lỗi khi lấy token:', error);
    return null;
  }
};

// Kiểm tra quyền từ API
export const checkPermissionAPI = async (chucVu: number, chucNang: string): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return false;
    }

    const response = await axios.post(
      `${API_URL}/api/check-permission/`,
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

// Lấy quyền hạn dựa vào vai trò
export const getPermissionsByRole = (chucVuNV?: number): Permissions => {
  // Quản lý (1) có tất cả quyền, Nhân viên (2) chỉ có quyền xem
  const isManager = chucVuNV === 1;
  
  return {
    canView: true, // Ai cũng có quyền xem
    canAdd: isManager,
    canEdit: isManager,
    canDelete: isManager
  };
};

// Đăng nhập và lấy token
export const login = async (SDTNV: string, MatKhau: string): Promise<UserInfo | null> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/api/login/`, {
      SDTNV,
      MatKhau
    });

    const { access, refresh } = response.data;

    // Lưu token
    if (Platform.OS === 'web') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    } else {
      await SecureStore.setItemAsync('access_token', access);
      await SecureStore.setItemAsync('refresh_token', refresh);
    }

    // Giải mã token để lấy thông tin người dùng
    const user = jwtDecode<UserInfo>(access);
    return user;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return null;
  }
};

// Đăng xuất
export const logout = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } else {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    }
    return true;
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    return false;
  }
};

// Hook để sử dụng trong các component
export const usePermissions = async (): Promise<Permissions> => {
  const user = await getUserFromToken();
  return getPermissionsByRole(user?.ChucVuNV);
};
