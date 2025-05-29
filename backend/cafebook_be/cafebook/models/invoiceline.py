from django.db import models
from .voucher import Voucher
from .product import SanPham
from .invoice import HoaDon

class DongHoaDon(models.Model):
    idhoadon = models.ForeignKey(HoaDon, on_delete=models.CASCADE, db_column='IDHoaDon')
    sottdong = models.IntegerField(db_column='SoTTDong')
    idsanpham = models.ForeignKey(SanPham, on_delete=models.CASCADE, db_column='IDSanPham')
    soluongsp = models.IntegerField(db_column='SoLuongSP')
    ghichu = models.CharField(max_length=255, blank=True, null=True, db_column='GhiChu')
    idvoucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, db_column='IDVoucher', blank=True, null=True)

    class Meta:
        db_table = 'donghoadon'
        unique_together = (('idhoadon', 'sottdong'),)
        managed = False