import random
import string
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from cafebook.models import NhanVien
from django.core.cache import cache
from ..auth.get_user_token import get_user_from_token
from django.http import JsonResponse
from django.db import connection
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from ..auth.get_user_token import get_user_from_token
from ..permissions import IsAuthenticatedWithJWT
from rest_framework.decorators import api_view, permission_classes

@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')
    phone = request.data.get('phoneNumber')

    try:
        # Kiểm tra xem có nhân viên với email và sđt không
        nhan_vien = NhanVien.objects.get(EmailNV=email, SDTNV=phone)

        # Tạo mã OTP 6 số
        otp = ''.join(random.choices(string.digits, k=6))

        # Lưu OTP vào cache với key là cả email + sdt
        cache_key = f'otp_{email}_{phone}'
        cache.set(cache_key, otp, 300)  # 5 phút

        # Gửi OTP qua email
        subject = 'Mã xác nhận đặt lại mật khẩu'
        message = f'Mã OTP của bạn là: {otp}. Mã này có hiệu lực trong 5 phút.'
        from_email = settings.EMAIL_HOST_USER
        recipient_list = [email]

        send_mail(subject, message, from_email, recipient_list)

        return Response({
            'message': 'Mã OTP đã được gửi đến email của bạn',
            'email': email,
            'phone': phone
        })

    except NhanVien.DoesNotExist:
        return Response({
            'error': 'Không tìm thấy nhân viên với email và số điện thoại đã cung cấp'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def verify_otp(request):
    email = request.data.get('email')
    phone = request.data.get('phoneNumber')
    otp = request.data.get('otp')

    cache_key = f'otp_{email}_{phone}'
    stored_otp = cache.get(cache_key)

    if not stored_otp:
        return Response({
            'error': 'Mã OTP đã hết hạn hoặc không tồn tại'
        }, status=status.HTTP_400_BAD_REQUEST)

    if otp != stored_otp:
        return Response({
            'error': 'Mã OTP không chính xác'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Xóa OTP sau khi xác thực thành công
    cache.delete(cache_key)

    return Response({
        'message': 'Xác thực OTP thành công',
        'email': email,
        'phone': phone
    })

@csrf_exempt
@api_view(['POST'])
def reset_password(request):
    print(">>> Đã nhận request đổi mật khẩu")
    print(f">>> Request data: {request.data}")
    
    # Lấy thông tin user từ token
    SDT = request.data.get('phoneNumber')

    try:
        data = request.data
        new_password = data.get('newPassword')
        
        # Kiểm tra dữ liệu
        if not new_password:
            return JsonResponse({
                'success': False,
                'message': 'Vui lòng điền đầy đủ thông tin'
            }, status=400)
        
        # Lấy mật khẩu hiện tại từ database
        with connection.cursor() as cursor:
            cursor.execute("SELECT MatKhauTK FROM taikhoan WHERE SDTNV = %s", [SDT])
            current_password_hash = cursor.fetchone()
            
            if not current_password_hash:
                return JsonResponse({
                    'success': False,
                    'message': 'Không tìm thấy tài khoản'
                }, status=404)
            
            # Cập nhật mật khẩu mới
            new_password_hash = make_password(new_password)
            cursor.execute(
                "UPDATE taikhoan SET MatKhauTK = %s WHERE SDTNV = %s",
                [new_password_hash, SDT]
            )
            
            print(f">>> Đổi mật khẩu thành công cho SDTNV: {SDT}")
            return JsonResponse({
                'success': True,
                'message': 'Đổi mật khẩu thành công'
            })
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f">>> ERROR: {str(e)}")
        print(error_trace)
        return JsonResponse({'success': False, 'message': str(e)}, status=500)