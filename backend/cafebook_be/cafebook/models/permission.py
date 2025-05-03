from django.db import models

class NhomQuyen(models.Model):
    idnhomquyen = models.IntegerField(primary_key=True)
    tennhomquyen = models.CharField(max_length=45)
    mota = models.CharField(max_length=45, null=True)

    class Meta:
        db_table = 'nhomquyen'

class Quyen(models.Model):
    idquyen = models.IntegerField(primary_key=True)
    module = models.CharField(max_length=45)
    action = models.CharField(max_length=45)
    code = models.CharField(max_length=45)

    class Meta:
        db_table = 'quyen'
