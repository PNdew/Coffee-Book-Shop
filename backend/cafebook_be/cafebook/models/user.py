from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from .rolls import ChucVu
# Define ChucVu model


class NhanVien(models.Model):
    IDNhanVien = models.AutoField(primary_key=True, db_column="IDNhanVien")
    TenNV = models.CharField(max_length=255, db_column="TenNV")
    SDTNV = models.CharField(max_length=15, unique=True, db_column="SDTNV")
    EmailNV = models.EmailField(max_length=255, blank=True, null=True, db_column="EmailNV")
    CCCDNV = models.CharField(max_length=20, unique=True, db_column="CCCDNV")
    ChucVu = models.ForeignKey(ChucVu, on_delete=models.CASCADE, db_column="IDChucVu")

    class Meta:
        db_table = 'nhanvien'
        managed = False

    def __str__(self):
        return self.TenNV 

# Model tài khoản chứa mật khẩu
class TaiKhoan(models.Model):
    id_tk = models.AutoField(primary_key=True, db_column="ID_TK")
    nhan_vien = models.OneToOneField(NhanVien, on_delete=models.CASCADE, to_field="SDTNV", db_column="SDTNV")
    mat_khau = models.CharField(max_length=255, db_column="MatKhauTK")

    def set_password(self, raw_password):
        self.mat_khau = make_password(raw_password)
        self.save()

    def check_password(self, raw_password):
        return check_password(raw_password, self.mat_khau)

    def __str__(self):
        return self.nhan_vien.TenNV

    class Meta:
        db_table = 'taikhoan'
        managed = False
