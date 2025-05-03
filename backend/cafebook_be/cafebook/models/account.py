from django.db import models
from .user import NhanVien

class TaiKhoan(models.Model):
    id_tk = models.IntegerField(primary_key=True, db_column='ID_TK')
    sdtnv = models.ForeignKey(NhanVien, on_delete=models.CASCADE, db_column='SDTNV', to_field='sdtnv')
    matkhautk = models.CharField(max_length=255, db_column='MatKhauTK')

    class Meta:
        db_table = 'taikhoan'
