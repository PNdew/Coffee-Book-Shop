import os
import django

# Khởi tạo Django môi trường
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cafebook_be.settings')
django.setup()

from cafebook.models import TaiKhoan
from django.contrib.auth.hashers import make_password

def migrate_passwords():
    accounts = TaiKhoan.objects.all()
    for account in accounts:
        raw_password = account.MatKhauTK
        if not raw_password.startswith('pbkdf2_'):  # Kiểm tra xem đã hash chưa
            account.MatKhauTK = make_password(raw_password)
            account.save()
            print(f'Đã mã hóa mật khẩu cho tài khoản {account.SDTNV}')

if __name__ == '__main__':
    migrate_passwords()
