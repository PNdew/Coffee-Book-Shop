from django.db import models

class NhanVien(models.Model):
    IDNhanVien = models.AutoField(primary_key=True)
    TenNV = models.CharField(max_length=255, null=False)
    SDTNV = models.CharField(max_length=15, unique=True, null=False)
    EmailNV = models.EmailField(max_length=255, blank=True, null=True)
    CCCDNV = models.CharField(max_length=20, unique=True, null=False)

    CHUC_VU_CHOICES = [
        ('QuanLy', 'Quản lý'),
        ('PhaChe', 'Pha chế'),
        ('ThuNgan', 'Thu ngân'),
        ('PhucVu', 'Phục vụ'),
        ('BaoVe', 'Bảo vệ'),
        ('DonDep', 'Dọn dẹp'),
    ]
    ChucVuNV = models.CharField(max_length=20, choices=CHUC_VU_CHOICES, null=False)

    USERNAME_FIELD = 'SDTNV'
    REQUIRED_FIELDS = ['TenNV', 'CCCDNV']

    def __str__(self):
        return self.TenNV
    
    class Meta:
        managed = False
        db_table = 'nhanvien'

# Model tài khoản chứa mật khẩu
class TaiKhoan(models.Model):
    idtaikhoan = models.IntegerField(primary_key=True)
    SDTNV = models.OneToOneField(NhanVien, to_field="SDTNV", on_delete=models.CASCADE, db_column="SDTNV")
    MatKhauTK = models.CharField(max_length=255, null=False)  

    def set_password(self, raw_password):
        self.MatKhauTK = raw_password
        self.save()

    def __str__(self):
        return self.SDTNV
    
    class Meta:
        managed = False
        db_table = 'taikhoan'
