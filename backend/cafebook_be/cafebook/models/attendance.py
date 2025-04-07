from django.db import models
from .user import NhanVien
from django.utils import timezone

class Attendance(models.Model):
    nhan_vien = models.ForeignKey(NhanVien, on_delete=models.CASCADE)
    check_in_time = models.DateTimeField(auto_now_add=True)
    latitude = models.FloatField()
    longitude = models.FloatField() 
    status = models.CharField(max_length=20, choices=[
        ('SUCCESS', 'Thành công'),
        ('FAILED', 'Thất bại')
    ])

    def __str__(self):
        return f"{self.nhan_vien.TenNV} - {self.check_in_time}"