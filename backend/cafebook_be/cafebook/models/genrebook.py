from .book import Sach
from .genre import TheLoai
from django.db import models
class TheLoaiCuaSach(models.Model):
    sach = models.ForeignKey(Sach, on_delete=models.CASCADE, db_column='IDSach')
    the_loai = models.ForeignKey(TheLoai, on_delete=models.CASCADE, db_column='IDTheLoai')

    class Meta:
        db_table = 'theloaicuasach'
        unique_together = ('sach', 'the_loai')
        managed = False