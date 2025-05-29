from django.db import models
from .rolls import ChucVu

class Quyen(models.Model):
    idquyen = models.CharField(max_length=50, primary_key=True, db_column='idquyen')
    chucnang = models.CharField(max_length=100, db_column='module')
    hanhdong = models.CharField(max_length=100, db_column='action')
    kyhieu = models.CharField(max_length=100, db_column='code')

    class Meta:
        db_table = 'quyen'
        managed = False



class NhomQuyen(models.Model):
    idnhomquyen = models.CharField(max_length=50, primary_key=True, db_column='idnhomquyen')
    tennhomquyen = models.CharField(max_length=100, db_column='tennhomquyen')
    mota = models.CharField(max_length=100, db_column='mota')

    class Meta:
        db_table = 'nhomquyen'
        managed = False


class NhomQuyen_Quyen(models.Model):
    idnhomquyen = models.ForeignKey(NhomQuyen, on_delete=models.CASCADE, db_column='idnhomquyen')
    idquyen = models.ForeignKey(Quyen, on_delete=models.CASCADE, db_column='idquyen')

    class Meta:
        db_table = 'nhomquyen_quyen'
        unique_together = ('idnhomquyen', 'idquyen')
        managed = False


class ChucVu_Quyen(models.Model):
    idchucvu = models.ForeignKey(ChucVu, on_delete=models.CASCADE, db_column='idchucvu')
    idnhomquyen = models.ForeignKey(NhomQuyen, on_delete=models.CASCADE, db_column='idnhomquyen')

    class Meta:
        db_table = 'chucvu_nhomquyen'
        unique_together = ('idchucvu', 'idnhomquyen')
        managed = False