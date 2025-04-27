from django.db import models
from .voucher import Voucher
from .product import Sanpham
from .invoice import Hoadon

class Donghoadon(models.Model):
    idhoadon = models.ForeignKey(Hoadon, on_delete=models.CASCADE, db_column='IDHoaDon')
    sottdong = models.IntegerField(db_column='SoTTDong')
    idsanpham = models.ForeignKey(Sanpham, on_delete=models.CASCADE, db_column='IDSanPham')
    soluongsp = models.IntegerField(db_column='SoLuongSP')
    ghichu = models.CharField(max_length=255, blank=True, null=True, db_column='GhiChu')
    idvoucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, db_column='IDVoucher', blank=True, null=True)

    def __str__(self):
        return f"{self.idhoadon} - {self.sottdong} - {self.sanpham.tensp} - {self.soluongsp}"
    
    class Meta:
        managed = False
        db_table = 'donghoadon'
        unique_together = (('idhoadon', 'sottdong'),)  # Giả định đây là khóa chính composite