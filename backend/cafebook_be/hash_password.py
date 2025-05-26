import os
import django

# Khởi tạo Django môi trường
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cafebook_be.settings')
django.setup()

from cafebook.models import TaiKhoan
from django.contrib.auth.hashers import make_password

def migrate_passwords():
    accounts = TaiKhoan.objects.all()
    updated_count = 0
    
    print(f"Tìm thấy {accounts.count()} tài khoản trong database")
    
    for account in accounts:
        raw_password = account.MatKhauTK
        print(f"Tài khoản {account.SDTNV}: {raw_password[:20]}...")  # In ra 20 ký tự đầu
        
        if not raw_password.startswith('pbkdf2_'):  # Kiểm tra xem đã hash chưa
            print(f"  -> Đang hash mật khẩu cho {account.SDTNV}")
            account.MatKhauTK = make_password(raw_password)
            account.save()
            updated_count += 1
            print(f"  -> Đã lưu: {account.MatKhauTK[:50]}...")
        else:
            print(f"  -> Đã được hash rồi")
    
    print(f"Hoàn thành! Đã cập nhật {updated_count} tài khoản")

if __name__ == '__main__':
    migrate_passwords()
