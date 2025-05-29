from django.db import models
from .user import NhanVien
from django.utils import timezone

class Attendance(models.Model):
    nhan_vien = models.ForeignKey(NhanVien, on_delete=models.CASCADE, db_column='SDTNV')
    check_in_time = models.DateTimeField(auto_now_add=True, db_column='CheckInTime')
    check_out_time = models.DateTimeField(null=True, blank=True, db_column='CheckOutTime')  # Thêm trường mới
    latitude = models.FloatField(db_column='Latitude')
    longitude = models.FloatField(db_column='Longitude')
    status = models.CharField(
        max_length=20, 
        choices=[
            ('CHECK_IN', 'Đã check in'),
            ('CHECK_OUT', 'Đã check out'),
            ('LATE', 'Đi trễ')
        ], 
        db_column='Status'
    )

    class Meta:
        db_table = 'chamcong'
        managed = False  # Make sure this is set to False

    def __str__(self):
        return f"{self.nhan_vien.TenNV} - {self.check_in_time}"