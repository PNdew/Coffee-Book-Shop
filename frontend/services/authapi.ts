import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from './getAPIUrl';

// Phần code còn lại giữ nguyên
export interface UserInfo {
  SDTNV: string;
  IDNhanVien: number;
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

// Interface cho đổi mật khẩu
export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

// Lấy thông tin người dùng từ token
export const getUserFromToken = async (): Promise<UserInfo | null> => {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    // Giải mã token để lấy thông tin
    const decoded: any = jwtDecode(token);
    console.log("Token decoded:", decoded); // Thêm log để debug

    // Đảm bảo có đủ thông tin cần thiết
    if (!decoded.SDTNV) {
      console.error("Token thiếu thông tin SDTNV");
      return null;
    }

    // Tạo đối tượng UserInfo từ token đã giải mã
    const userInfo: UserInfo = {
      SDTNV: decoded.SDTNV,
      IDNhanVien: decoded.IDNhanVien,
      TenNV: decoded.TenNV || "Người dùng", // Đây là dòng có thể gây ra vấn đề
      ChucVuNV: decoded.ChucVuNV,
      exp: decoded.exp
    };
    
    return userInfo;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin từ token:', error);
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
  // Quản lý (1) có tất cả quyền, Nhân viên (2) chỉ có quyền xem và thêm
  const isManager = chucVuNV === 1;
  
  return {
    canView: true, // Ai cũng có quyền xem
    canAdd: true,  // Cả quản lý và nhân viên đều có quyền thêm hóa đơn mới
    canEdit: isManager, // Chỉ quản lý mới có quyền chỉnh sửa
    canDelete: isManager // Chỉ quản lý mới có quyền xóa, nhân viên KHÔNG có quyền xóa hóa đơn
  };
};

// Đăng nhập và lấy token
export const login = async (SDTNV: string, MatKhau: string): Promise<UserInfo | null> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/login/`, {
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

// API đổi mật khẩu
export const changePassword = async (passwordData: ChangePasswordData): Promise<any> => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error("Không có token, vui lòng đăng nhập lại");
    }
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await axios.post(`${API_URL}/change-password/`, passwordData, config);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const forgotPassword = async (email: string, phoneNumber: string) => {
  try {
    const response = await axios.post(`${API_URL}/forgot-password/`, { email, phoneNumber });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Lỗi khi gửi mã OTP');
  }
};

export const verifyOTP = async (email: string, phoneNumber: string, otp: string) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp/`, { email, phoneNumber, otp });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Lỗi khi xác thực OTP');
  }
};

export const resetPassword = async (phoneNumber: string, newPassword: string) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password/`, { 
      phoneNumber, 
      newPassword 
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Lỗi khi đặt lại mật khẩu');
  }
};