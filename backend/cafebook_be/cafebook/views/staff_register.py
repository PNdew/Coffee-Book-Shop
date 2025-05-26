from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, transaction
from django.contrib.auth.hashers import make_password
import json
import traceback

from ..auth.get_user_token import get_user_from_token
from ..permissions import IsAuthenticatedWithJWT
from rest_framework.decorators import api_view, permission_classes

# Hàm convert từ cursor -> dict
def dictfetchone(cursor):
    columns = [col[0] for col in cursor.description]
    row = cursor.fetchone()
    if row is None:
        return None
    return dict(zip(columns, row))

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticatedWithJWT])
def register_staff(request):
    print(">>> Đã nhận request đăng ký nhân viên")
    print(f">>> Request data: {request.data}")
    
    # Kiểm tra quyền (chỉ quản lý mới được tạo nhân viên)
    user, error = get_user_from_token(request)
    print(f">>> User token data: {user}, Error: {error}")
    
    try:
        # Kiểm tra quyền quản lý
        if not user or error:
            print(">>> Lỗi xác thực token")
            return JsonResponse({'success': False, 'message': error or 'Token không hợp lệ'}, status=403)
            
        chuc_vu_nv = user.get('ChucVuNV')
        print(f">>> Chức vụ người dùng: {chuc_vu_nv}")
        
        # Chỉ quản lý (ChucVuNV = 1) mới có quyền tạo nhân viên
        if chuc_vu_nv != 1 and chuc_vu_nv != '1':
            print(">>> Người dùng không có quyền quản lý")
            return JsonResponse({
                'success': False, 
                'message': 'Bạn không có quyền tạo tài khoản nhân viên'
            }, status=403)
        
        # Lấy dữ liệu từ request
        data = request.data
        print(f">>> Data từ request: {data}")
        
        ten_nv = data.get('TenNV')
        sdt_nv = data.get('SDTNV')
        email_nv = data.get('EmailNV', '')
        cccd_nv = data.get('CCCDNV')
        chuc_vu = data.get('ChucVuNV', '2')  # Mặc định là nhân viên
        mat_khau = data.get('MatKhau')
        
        # Kiểm tra dữ liệu
        if not ten_nv or not sdt_nv or not cccd_nv or not mat_khau:
            print(">>> Thiếu thông tin bắt buộc")
            return JsonResponse({
                'success': False,
                'message': 'Vui lòng điền đầy đủ thông tin'
            }, status=400)
        
        # Kiểm tra số điện thoại và CCCD đã tồn tại chưa
        with connection.cursor() as cursor:
            # Kiểm tra SĐT
            cursor.execute("SELECT COUNT(*) FROM nhanvien WHERE SDTNV = %s", [sdt_nv])
            if cursor.fetchone()[0] > 0:
                print(f">>> SĐT {sdt_nv} đã tồn tại")
                return JsonResponse({
                    'success': False, 
                    'message': 'Số điện thoại đã được sử dụng'
                }, status=400)
            
            # Kiểm tra CCCD
            cursor.execute("SELECT COUNT(*) FROM nhanvien WHERE CCCDNV = %s", [cccd_nv])
            if cursor.fetchone()[0] > 0:
                print(f">>> CCCD {cccd_nv} đã tồn tại")
                return JsonResponse({
                    'success': False, 
                    'message': 'CCCD đã được sử dụng'
                }, status=400)
                
        # Tạo nhân viên và tài khoản trong một transaction
        with transaction.atomic():
            # Tạo mới nhân viên
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO nhanvien (TenNV, SDTNV, EmailNV, CCCDNV, IDChucVu)
                    VALUES (%s, %s, %s, %s, %s)
                """, [ten_nv, sdt_nv, email_nv, cccd_nv, chuc_vu])
                
                # Lấy ID vừa tạo
                cursor.execute("SELECT LAST_INSERT_ID()")
                id_nhan_vien = cursor.fetchone()[0]
                
                # Tạo ID mới cho tài khoản
                cursor.execute("SELECT COALESCE(MAX(ID_TK), 0) + 1 FROM taikhoan")
                new_id = cursor.fetchone()[0]
            
            # Tạo tài khoản với mật khẩu đã mã hóa
            hashed_password = make_password(mat_khau)
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO taikhoan (ID_TK, SDTNV, MatKhauTK)
                    VALUES (%s, %s, %s)
                """, [new_id, sdt_nv, hashed_password])
            
            print(f">>> Tạo nhân viên thành công: {id_nhan_vien}, {ten_nv}")
            return JsonResponse({
                'success': True,
                'message': 'Tạo nhân viên thành công',
                'data': {
                    'IDNhanVien': id_nhan_vien,
                    'TenNV': ten_nv,
                    'SDTNV': sdt_nv
                }
            }, status=201)
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f">>> ERROR: {str(e)}")
        print(error_trace)
        return JsonResponse({'success': False, 'message': str(e)}, status=500)
