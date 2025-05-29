from django.db import models
from cloudinary.models import CloudinaryField

class Sanpham(models.Model):
    idsanpham = models.AutoField(primary_key=True)
    tensp = models.CharField(max_length=100)
    giasp = models.DecimalField(max_digits=10, decimal_places=2)
    trangthaisp = models.IntegerField()
    loaisp = models.CharField(max_length=50)
    hinhanh = CloudinaryField('image', null=True, blank=True)

    class Meta:
        db_table = 'sanpham'

    def __str__(self):
        return self.tensp 