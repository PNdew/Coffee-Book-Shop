from rest_framework import serializers
from .models import Sanpham, Voucher, Donghoadon, Hoadon, NguyenLieu, Sach

class SanphamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sanpham
        fields = ['idsanpham', 'tensp', 'giasp', 'trangthaisp', 'loaisp']

class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = ['idvoucher', 'loaisp', 'thoigianbatdauvoucher', 
                 'thoigianketthucvoucher', 'giamgia']

class DonghoadonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donghoadon
        fields = '__all__'

    def perform_create(self, serializer):
        idhoadon = self.validated_data.get('idhoadon')

        if idhoadon:
            # Đếm số dòng hiện có với idhoadon và tự động tăng SoTTDong
            existing_lines = Donghoadon.objects.filter(idhoadon=idhoadon).count()
            # Tự động gán giá trị SoTTDong
            serializer.save(sottdong=existing_lines + 1)
        else:
            raise serializers.ValidationError({"idhoadon": "Hóa đơn không được để trống"})

class HoadonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hoadon
        fields = ['idhoadon', 'ngayhd', 'idnhanvien']

class NguyenLieuSerializer(serializers.ModelSerializer):
    class Meta:
        model = NguyenLieu
        fields = '__all__'

class SachSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sach
        fields = '__all__'