from django.db import models

class Sanpham(models.Model):
    idsanpham = models.IntegerField(primary_key=True)
    tensp = models.CharField(max_length=255)  # Độ dài tùy thuộc vào cấu trúc thực tế
    giasp = models.DecimalField(max_digits=10, decimal_places=2)
    trangthaisp = models.IntegerField()
    loaisp = models.CharField(max_length=50)

    def __str__(self):
        return self.tensp
    
    class Meta:
        managed = False
        db_table = 'sanpham'
