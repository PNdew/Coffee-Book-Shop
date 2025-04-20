from django.db import models
from django.contrib.auth.hashers import make_password, check_password

class NhanVien(models.Model):
    IDNhanVien = models.AutoField(primary_key=True, db_column="IDNhanVien")
    TenNV = models.CharField(max_length=255, null=False, db_column="TenNV")
    SDTNV = models.CharField(max_length=15, unique=True, null=False, db_column="SDTNV")
    EmailNV = models.EmailField(max_length=255, blank=True, null=True, db_column="EmailNV")
    CCCDNV = models.CharField(max_length=20, unique=True, null=False, db_column="CCCDNV")
    ChucVuNV = models.CharField(max_length=20, null=False, db_column="IDChucVu")

    USERNAME_FIELD = 'SDTNV'
    REQUIRED_FIELDS = ['TenNV', 'CCCDNV']

    def __str__(self):
        return self.TenNV
    
    class Meta:
        managed = False
        db_table = 'nhanvien'

# Model tài khoản chứa mật khẩu
class TaiKhoan(models.Model):
    idtaikhoan = models.IntegerField(primary_key=True, db_column="ID_TK")
    SDTNV = models.OneToOneField(NhanVien, to_field="SDTNV", on_delete=models.CASCADE, db_column="SDTNV")
    MatKhauTK = models.CharField(max_length=255, null=False, db_column="MatKhauTK")  

    def set_password(self, raw_password):
        self.MatKhauTK = make_password(raw_password)
        self.save()

    def check_password(self, raw_password):
        return check_password(raw_password, self.MatKhauTK)
    
    def __str__(self):
        return self.SDTNV
    
    class Meta:
        managed = False
        db_table = 'taikhoan'
