from django.db import models

class SanPham(models.Model):  # Changed from Sanpham to SanPham
    idsanpham = models.AutoField(primary_key=True, db_column='IDSanPham')
    tensp = models.CharField(max_length=255, db_column='TenSP')
    giasp = models.DecimalField(max_digits=10, decimal_places=2, db_column='GiaSP')
    trangthaisp = models.IntegerField(db_column='TrangThaiSP')
    loaisp = models.CharField(max_length=50, db_column='LoaiSP')

    class Meta:
        db_table = 'sanpham'
        managed = False

    def __str__(self):
        return self.tensp

