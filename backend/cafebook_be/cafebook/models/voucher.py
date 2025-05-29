from django.db import models

class Voucher(models.Model):
    idvoucher = models.AutoField(primary_key=True, db_column="IDVoucher")
    tenvoucher = models.CharField(max_length=100, db_column="TenVoucher")
    loaisp = models.CharField(max_length=50, db_column="LoaiSP")
    giamgia = models.IntegerField(db_column="GiamGia")
    thoigianbatdauvoucher = models.DateTimeField(db_column="ThoiGianBatDauVoucher")
    thoigianketthucvoucher = models.DateTimeField(db_column="ThoiGianKetThucVoucher")

    class Meta:
        managed = False
        db_table = 'voucher'
