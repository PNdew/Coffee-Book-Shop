// Types hiện tại cho React Native
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Thêm các interface mới cho API Django
export interface SanphamAPI {
  idsanpham: number;
  tensp: string;
  giasp: number;
  trangthaisp: number;
  loaisp: string;
  hinhanh: string | null;
  imageUrl?: string; // Keep for backward compatibility
}

export interface Voucher {
  idvoucher: number;
  tenvoucher: string;
  loaisp: string;
  thoigianbatdauvoucher: string;
  thoigianketthucvoucher: string;
  giamgia: number;
}

export interface VoucherInput {
  tenvoucher: string;
  loaisp: string;
  thoigianbatdauvoucher: string;
  thoigianketthucvoucher: string;
  giamgia: number;
}

export interface DonghoadonAPI {
  idhoadon: number;
  sottdong: number;
  sanpham: number;
  soluongsp: number;
  ghichu?: string;
  voucher?: number;
}
// API OrderHeader interface
export interface APIOrderHeader {
  idhoadon?: number;  // Optional as it will be generated by API
  ngayhd?: string;    // Backend uses auto_now_add=True
  idnhanvien: number | string; // ID of employee creating the order
  tongtien?: number;  // Will be calculated on the backend
  trangthaithanhtoan?: number;
}

// API OrderLine interface
export interface APIOrderLine {
  idhoadon?: number;  // Will be filled in backend
  sottdong?: number;  // Will be filled in backend
  idsanpham: number;
  soluongsp: number;
  ghichu?: string;
  idvoucher?: number | null;
}

// API CompleteOrder interface
export interface APICompleteOrder {
  header: APIOrderHeader;
  lines: APIOrderLine[];
}

// Interface cho nguyên liệu
export interface Ingredient {
  id: number;
  ten_nguyen_lieu: string;
  so_luong: number;
  don_vi: string;
  gia_nhap: number;
}

// Interface cho đầu vào khi tạo nguyên liệu mới
export interface IngredientInput {
  ten_nguyen_lieu: string;
  so_luong: number;
  don_vi: string;
  gia_nhap: number;
}

export interface TheLoai {
  id: number;
  ten_the_loai: string;
}

export interface Book {
  id: number;
  ten_sach: string;
  tac_gia: string;
  so_luong_sach: number
  trang_thai: string;
  the_loai_list?: TheLoai[];
}

export interface BookInput {
  ten_sach: string;
  tac_gia: string;
  so_luong_sach: number;
  trang_thai: string;
  the_loai_ids: number[];
}

export interface UserInfo {
  SDTNV: string;
  TenNV: string;
  ChucVuNV: number;
  exp?: number;
};