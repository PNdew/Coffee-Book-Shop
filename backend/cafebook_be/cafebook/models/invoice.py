from django.db import models
from .user import NhanVien
class HoaDon(models.Model):
    id_hoadon = models.AutoField(primary_key=True, db_column='IDHoaDon')

    class Meta:
        db_table = 'hoadon'
        managed = False
