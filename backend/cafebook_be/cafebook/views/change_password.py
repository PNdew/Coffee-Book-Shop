from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from django.contrib.auth.hashers import make_password, check_password

from ..auth.get_user_token import get_user_from_token
from ..permissions import IsAuthenticatedWithJWT
from rest_framework.decorators import api_view, permission_classes

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticatedWithJWT])
def change_password(request):
    print(">>> Đã nhận request đổi mật khẩu")
    print(f">>> Request data: {request.data}")
    
    # Lấy thông tin user từ token
    user, error = get_user_from_token(request)
    if not user or error:
        return JsonResponse({'success': False, 'message': 'Token không hợp lệ'}, status=403)
    
    try:
        data = request.data
        old_password = data.get('oldPassword')
        new_password = data.get('newPassword')
        
        # Kiểm tra dữ liệu
        if not old_password or not new_password:
            return JsonResponse({
                'success': False,
                'message': 'Vui lòng điền đầy đủ thông tin'
            }, status=400)
        
        # Lấy mật khẩu hiện tại từ database
        with connection.cursor() as cursor:
            cursor.execute("SELECT MatKhauTK FROM taikhoan WHERE SDTNV = %s", [user['SDTNV']])
            current_password_hash = cursor.fetchone()
            
            if not current_password_hash:
                return JsonResponse({
                    'success': False,
                    'message': 'Không tìm thấy tài khoản'
                }, status=404)
            
            # Kiểm tra mật khẩu cũ
            if not check_password(old_password, current_password_hash[0]):
                return JsonResponse({
                    'success': False,
                    'message': 'Mật khẩu cũ không đúng'
                }, status=400)
            
            # Cập nhật mật khẩu mới
            new_password_hash = make_password(new_password)
            cursor.execute(
                "UPDATE taikhoan SET MatKhauTK = %s WHERE SDTNV = %s",
                [new_password_hash, user['SDTNV']]
            )
            
            print(f">>> Đổi mật khẩu thành công cho SDTNV: {user['SDTNV']}")
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