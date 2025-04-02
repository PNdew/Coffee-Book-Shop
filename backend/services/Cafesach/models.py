from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
# from django.contrib.auth.hashers import make_password, check_password

# Quản lý tài khoản nhân viên
class NhanVienManager(BaseUserManager):
    def create_user(self, SDTNV, TenNV, CCCDNV, password=None):
        if not SDTNV:
            raise ValueError("Người dùng phải có số điện thoại!")
        user = self.model(SDTNV=SDTNV, TenNV=TenNV, CCCDNV=CCCDNV)
        user.save(using=self._db)
        return user

    def create_superuser(self, SDTNV, TenNV, CCCDNV, password=None):
        user = self.create_user(SDTNV, TenNV, CCCDNV)
        user.is_staff = False
        user.is_superuser = True
        user.save(using=self._db)
        return user

class NhanVien(AbstractBaseUser, PermissionsMixin):
    password = None

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

    is_staff = models.BooleanField(default=False)

    objects = NhanVienManager()

    USERNAME_FIELD = 'SDTNV'
    REQUIRED_FIELDS = ['TenNV', 'CCCDNV']

    def __str__(self):
        return f"{self.TenNV} - {self.SDTNV}"

# Model tài khoản chứa mật khẩu
class TaiKhoan(models.Model):
    SDTNV = models.OneToOneField(NhanVien, to_field="SDTNV", on_delete=models.CASCADE, db_column="SDTNV", primary_key=True)
    MatKhauTK = models.CharField(max_length=255, null=False)  # Lưu mật khẩu đã mã hóa
    last_login = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Đồng bộ last_login với bảng NhanVien
        if self.last_login:
            self.SDTNV.last_login = self.last_login
            self.SDTNV.save()
        super().save(*args, **kwargs)

    def set_password(self, raw_password):
        self.MatKhauTK = raw_password
        self.save()

    def __str__(self):
        return f"Tài khoản của {self.SDTNV.TenNV}"
