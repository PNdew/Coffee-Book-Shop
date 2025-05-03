from .book import Sach
from .genre import TheLoai
from django.db import models
class TheLoaiCuaSach(models.Model):
    sach = models.ForeignKey(Sach, on_delete=models.CASCADE, db_column='IDSach', primary_key=True)
    the_loai = models.ForeignKey(TheLoai, on_delete=models.CASCADE, db_column='IDTheLoai')
    
    class Meta:
        db_table = 'theloaicuasach'  # Kết nối với bảng MySQL hiện có
        unique_together = ('sach', 'the_loai')
        verbose_name = "Thể Loại Của Sách"
        verbose_name_plural = "Thể Loại Của Sách"
        managed = False  # Django không quản lý bảng này