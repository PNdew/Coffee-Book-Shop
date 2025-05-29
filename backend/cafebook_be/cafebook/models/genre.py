import os
from django.db import models
class TheLoai(models.Model):
    id = models.AutoField(primary_key=True, db_column='IDTheLoai')
    ten_the_loai = models.CharField(max_length=255, db_column='TenTheLoai')

    class Meta:
        db_table = 'theloai'
        managed = False

    def __str__(self):
        return self.ten_the_loai