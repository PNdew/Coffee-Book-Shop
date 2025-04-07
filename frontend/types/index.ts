// Types hiện tại cho React Native
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Voucher {
  id: string;
  title: string;
  expireDate: string;
  discountValue: string;
  discountType: 'percentage' | 'fixed';
  minimumOrderValue?: number;
  applicableItems?: string[];
}

// Thêm các interface mới cho API Django
export interface SanphamAPI {
  idsanpham: number;
  tensp: string;
  giasp: number;
  trangthaisp: number;
  loaisp: string;
}

export interface VoucherAPI {
  idvoucher: number;
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

