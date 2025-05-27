from rest_framework import serializers
from .models import Sanpham, Voucher, Donghoadon, Hoadon, NguyenLieu, Sach, TheLoai, TheLoaiCuaSach
from django.db import connection
from .models.rolls import ChucVu
from .models.user import NhanVien, TaiKhoan
from .models.permission import NhomQuyen, Quyen

class SanphamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sanpham
        fields = ['idsanpham', 'tensp', 'giasp', 'trangthaisp', 'loaisp']
        read_only_fields = ['idsanpham']

    def validate_giasp(self, value):
        # Chuyển đổi số nguyên thành Decimal nếu cần
        if isinstance(value, int):
            return float(value)
        return value

class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = ['idvoucher', 'loaisp', 'thoigianbatdauvoucher', 
                 'thoigianketthucvoucher', 'giamgia']

class DonghoadonSerializer(serializers.ModelSerializer):
    sanpham_info = serializers.SerializerMethodField()
    voucher_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Donghoadon
        fields = ['idhoadon', 'sottdong', 'idsanpham', 'soluongsp', 'ghichu', 'idvoucher', 'sanpham_info', 'voucher_info']
    
    def get_sanpham_info(self, obj):
        if not obj.idsanpham:
            return None
        return {
            'idsanpham': obj.idsanpham.idsanpham,
            'tensp': obj.idsanpham.tensp,
            'giasp': obj.idsanpham.giasp,
            'loaisp': obj.idsanpham.loaisp
        }
    
    def get_voucher_info(self, obj):
        if not obj.idvoucher:
            return None
        return VoucherSerializer(obj.idvoucher).data

class HoadonSerializer(serializers.ModelSerializer):
    donghoadon = serializers.SerializerMethodField()
    
    class Meta:
        model = Hoadon
        fields = ['idhoadon', 'ngayhd', 'idnhanvien', 'donghoadon']
    
    def get_donghoadon(self, obj):
        try:
            # Sử dụng raw SQL để debug và xác định chính xác nguyên nhân
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT dh.SoTTDong, dh.IDSanPham, dh.SoLuongSP, dh.GhiChu, dh.IDVoucher,
                           sp.tensp, sp.giasp, sp.loaisp
                    FROM donghoadon dh
                    JOIN sanpham sp ON dh.IDSanPham = sp.idsanpham
                    WHERE dh.IDHoaDon = %s
                    ORDER BY dh.SoTTDong
                """, [obj.idhoadon])
                dong_hoa_don_data = cursor.fetchall()
                
            # Nếu không có dữ liệu từ raw query, thử dùng ORM bình thường
            if not dong_hoa_don_data:
                dong_hoa_don = Donghoadon.objects.filter(idhoadon=obj).order_by('sottdong')
                return DonghoadonSerializer(dong_hoa_don, many=True).data
            
            # Chuyển đổi dữ liệu từ raw query thành cấu trúc tương thích với serializer
            result = []
            for row in dong_hoa_don_data:
                so_tt_dong, id_san_pham, so_luong_sp, ghi_chu, id_voucher, ten_sp, gia_sp, loai_sp = row
                
                # Lấy thông tin voucher nếu có
                voucher_info = None
                if id_voucher:
                    try:
                        voucher = Voucher.objects.get(idvoucher=id_voucher)
                        voucher_info = VoucherSerializer(voucher).data
                    except Voucher.DoesNotExist:
                        pass
                
                # Tạo cấu trúc dữ liệu dòng hóa đơn
                dong_hoa_don_item = {
                    'idhoadon': obj.idhoadon,
                    'sottdong': so_tt_dong,
                    'idsanpham': id_san_pham,
                    'soluongsp': so_luong_sp,
                    'ghichu': ghi_chu,
                    'idvoucher': id_voucher,
                    'sanpham_info': {
                        'idsanpham': id_san_pham,
                        'tensp': ten_sp,
                        'giasp': float(gia_sp) if gia_sp else 0,
                        'loaisp': loai_sp
                    },
                    'voucher_info': voucher_info
                }
                result.append(dong_hoa_don_item)
            
            return result
        except Exception as e:
            print(f"Lỗi khi lấy dòng hóa đơn: {str(e)}")
            return []

class NguyenLieuSerializer(serializers.ModelSerializer):
    class Meta:
        model = NguyenLieu
        fields = '__all__'

class TheLoaiSerializer(serializers.ModelSerializer):
    class Meta:
        model = TheLoai
        fields = '__all__'

class SachSerializer(serializers.ModelSerializer):
    the_loai_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=TheLoai.objects.all(),
        required=False, 
        write_only=True
    )
    the_loai_list = serializers.SerializerMethodField()

    class Meta:
        model = Sach
        fields = '__all__'
    
    def get_the_loai_list(self, obj):
        the_loai_cua_sach = TheLoaiCuaSach.objects.filter(sach=obj)
        return [
            {
                'id': item.the_loai.id,
                'ten_the_loai': item.the_loai.ten_the_loai
            }
            for item in the_loai_cua_sach
        ]
    
    def create(self, validated_data):
        the_loai_ids = validated_data.pop('the_loai_ids', [])
        sach = Sach.objects.create(**validated_data)
        
        for the_loai in the_loai_ids:
            TheLoaiCuaSach.objects.create(sach=sach, the_loai=the_loai)
        
        return sach
    
    def update(self, instance, validated_data):
        the_loai_ids = validated_data.pop('the_loai_ids', None)
        
        # Cập nhật các trường của sách
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Nếu có cập nhật thể loại
        if the_loai_ids is not None:
            # Xóa tất cả liên kết cũ
            TheLoaiCuaSach.objects.filter(sach=instance).delete()
            
            # Tạo liên kết mới
            for the_loai in the_loai_ids:
                TheLoaiCuaSach.objects.create(sach=instance, the_loai=the_loai)
        
        return instance

class QuyenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quyen
        fields = '__all__'

class NhomQuyenSerializer(serializers.ModelSerializer):
    class Meta:
        model = NhomQuyen
        fields = '__all__'

class ChucVuSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChucVu
        fields = '__all__'

class NhanVienSerializer(serializers.ModelSerializer):
    ten_chuc_vu = serializers.SerializerMethodField()
    
    class Meta:
        model = NhanVien
        fields = ['IDNhanVien', 'TenNV', 'SDTNV', 'EmailNV', 'CCCDNV', 'ChucVuNV', 'ten_chuc_vu']
    
    def get_ten_chuc_vu(self, obj):
        # Thêm logic lấy tên chức vụ nếu cần
        return "Quản lý" if obj.ChucVuNV == "1" else "Nhân viên"

class TaiKhoanSerializer(serializers.ModelSerializer):
    ten_nhan_vien = serializers.CharField(source='SDTNV.TenNV', read_only=True)
    
    class Meta:
        model = TaiKhoan
        fields = ['idtaikhoan', 'SDTNV', 'ten_nhan_vien']
        extra_kwargs = {'MatKhauTK': {'write_only': True}}

class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)
        