from django.db import models

class TheLoai(models.Model):
    id = models.AutoField(primary_key=True, db_column='IDTheLoai')
    ten_the_loai = models.CharField(max_length=255, null=True, db_column='TenTheLoai')
    
    class Meta:
        db_table = 'theloai'  # Kết nối với bảng MySQL hiện có
        verbose_name = "Thể Loại"
        verbose_name_plural = "Thể Loại"
        ordering = ['ten_the_loai']
        managed = False  # Django không quản lý bảng này
        
    def __str__(self):
        return self.ten_the_loai