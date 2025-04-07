from django.db import models
from .voucher import Voucher
from .product import Sanpham
from .invoice import Hoadon

class Donghoadon(models.Model):
    idhoadon = models.ForeignKey(Hoadon, on_delete=models.CASCADE, db_column='idhoadon')
    sottdong = models.AutoField(primary_key=True)
    sanpham = models.ForeignKey(Sanpham, on_delete=models.CASCADE, db_column='idsanpham')
    soluongsp = models.IntegerField()
    ghichu = models.CharField(max_length=255, blank=True, null=True)
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, db_column='idvoucher', blank=True, null=True)

    def __str__(self):
        return f"{self.idhoadon} - {self.sottdong} - {self.sanpham.tensp} - {self.soluongsp}"
    
    class Meta:
        managed = False
        db_table = 'donghoadon'
        unique_together = (('idhoadon', 'sottdong'),)  # Giả định đây là khóa chính composite