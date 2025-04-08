import { SanphamAPI, VoucherAPI, DonghoadonAPI, OrderItem, Voucher } from '../types';

const API_BASE_URL = 'http://192.168.85.15:8000/api'; 

// Hàm chuyển đổi từ SanphamAPI sang OrderItem
export const convertSanphamToOrderItem = (sanpham: SanphamAPI): OrderItem => {
  return {
    id: sanpham.idsanpham.toString(),
    name: sanpham.tensp,
    price: sanpham.giasp,
    quantity: 1,
    image: undefined // Cần cập nhật nếu có hình ảnh từ API
  };
};

// Hàm chuyển đổi từ VoucherAPI sang Voucher
export const convertVoucherAPIToVoucher = (voucherAPI: VoucherAPI): Voucher => {
  return {
    id: voucherAPI.idvoucher.toString(),
    title: `Giảm giá ${voucherAPI.giamgia}% cho ${voucherAPI.loaisp}`,
    expireDate: voucherAPI.thoigianketthucvoucher,
    discountValue: voucherAPI.giamgia.toString(),
    discountType: 'percentage',
    minimumOrderValue: 0
  };
};

// Lấy danh sách sản phẩm từ API
export const fetchSanpham = async (): Promise<SanphamAPI[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout
    
    const response = await fetch(`${API_BASE_URL}/sanpham/`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching sanpham:', error);
    throw error;
  }
};

// Lấy danh sách voucher từ API
export const fetchVoucher = async (): Promise<VoucherAPI[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/voucher/`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching voucher:', error);
    throw error;
  }
};

// Tạo đơn hàng mới

// Cập nhật hàm createDonghoadon để thêm timeout
export const createDonghoadon = async (donghoadon: Omit<DonghoadonAPI, 'idhoadon' | 'sottdong'>): Promise<DonghoadonAPI> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 giây timeout
    
    const response = await fetch(`${API_BASE_URL}/donghoadon/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      },
      body: JSON.stringify(donghoadon),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timed out');
      throw new Error('Kết nối đến máy chủ quá lâu, vui lòng thử lại sau.');
    }
    console.error('Error creating donghoadon:', error);
    throw error;
  }
};

export const submitOrderToAPI = async (): Promise<boolean> => {
   try {
     // Xử lý logic gửi đơn hàng
     return true;
   } catch (error) {
     console.error('Error submitting order:', error);
     return false;
   }
 };