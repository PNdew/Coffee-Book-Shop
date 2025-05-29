from django.db import models

class NguyenLieu(models.Model):
    id = models.AutoField(primary_key=True, db_column='IDNguyenLieu')
    ten_nguyen_lieu = models.CharField(max_length=255, db_column='TenNguyenLieu')
    so_luong = models.CharField(max_length=50, db_column='SoLuong')
    gia_nhap = models.PositiveIntegerField(db_column='GiaNhap')
    
    class Meta:
        db_table = 'nguyenlieu'
        managed = False  # Add this line
        verbose_name = "Nguyên liệu"
        verbose_name_plural = "Nguyên liệu"
        ordering = ['ten_nguyen_lieu']
    
    def __str__(self):
        return f"{self.ten_nguyen_lieu} ({self.so_luong})"