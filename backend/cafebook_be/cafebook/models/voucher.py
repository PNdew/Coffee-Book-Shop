from django.db import models

class Voucher(models.Model):
    idvoucher = models.IntegerField(primary_key=True)
    loaisp = models.CharField(max_length=50)
    thoigianbatdauvoucher = models.DateTimeField()
    thoigianketthucvoucher = models.DateTimeField()
    giamgia = models.IntegerField()

    def __str__(self):
        return self.idvoucher, self.loaisp
    
    class Meta:
        managed = False
        db_table = 'voucher'