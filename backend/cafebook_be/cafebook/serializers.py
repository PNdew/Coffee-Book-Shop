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
        fields = ['idhoadon', 'sanpham', 'soluongsp', 
                 'ghichu', 'voucher']

class HoadonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hoadon
        fields = ['idhoadon', 'ngayhd', 'tongtienhd']

class NguyenLieuSerializer(serializers.ModelSerializer):
    class Meta:
        model = NguyenLieu
        fields = '__all__'

class SachSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sach
        fields = '__all__'