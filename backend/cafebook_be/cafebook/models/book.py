from django.db import models

# Create your models here.

class Sach(models.Model):
    id = models.AutoField(primary_key=True, db_column='IDSach')
    ten_sach = models.CharField(max_length=255, unique=True, null=True, db_column='TenSach')
    tac_gia = models.CharField(max_length=255, null=True, db_column='TacGia')
    so_luong_sach = models.IntegerField(db_column='SoLuongSach')
    
    class Meta:
        db_table = 'sach'  # Để kết nối với bảng MySQL hiện có
        verbose_name = "Sách"
        verbose_name_plural = "Sách"
        ordering = ['ten_sach']

    def __str__(self):
        return f"{self.ten_sach} ({self.tac_gia})"