from django.db import models
from .user import NhanVien

class Hoadon(models.Model):
    idhoadon = models.AutoField(primary_key=True)
    ngayhd = models.DateTimeField(auto_now_add=True)
    idnhanvien = models.ForeignKey('NhanVien', on_delete=models.CASCADE, db_column='idnhanvien')
    tongtienhd = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.idhoadon} - {self.ngayhd} - {self.idnhanvien} - {self.tongtienhd}"
    
    class Meta:
        managed = False
        db_table = 'hoadon'