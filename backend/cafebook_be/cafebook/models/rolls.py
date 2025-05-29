from django.db import models

class ChucVu(models.Model):
    idchucvu = models.IntegerField(primary_key=True, db_column='idchucvu')
    loaichucvu = models.CharField(max_length=45, db_column='loaichucvu')

    class Meta:
        db_table = 'chucvu'