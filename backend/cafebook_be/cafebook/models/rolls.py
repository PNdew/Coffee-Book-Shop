from django.db import models

class ChucVu(models.Model):
    idchucvu = models.IntegerField(primary_key=True)
    loaichucvu = models.CharField(max_length=45)

    class Meta:
        db_table = 'chucvu'
