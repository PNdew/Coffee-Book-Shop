import os
import jwt
from django.db import connection
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth.hashers import check_password
from datetime import datetime, timedelta
from ..auth.jwt_handler import JWTHandler

# Hàm convert từ cursor -> dict
def dictfetchone(cursor):
    columns = [col[0] for col in cursor.description]
    row = cursor.fetchone()
    if row is None:
        return None
    return dict(zip(columns, row))

@api_view(['POST'])
def login_view(request):
    SDTNV = request.data.get('SDTNV')
    MatKhau = request.data.get('MatKhau')
    
    # Hỗ trợ cả tham số từ auth.py
    if not SDTNV:
        SDTNV = request.data.get('phone')
    if not MatKhau:
        MatKhau = request.data.get('password')
        
    print(f"DEBUG LOGIN: SDTNV={SDTNV}, MatKhau={MatKhau}")

    if not SDTNV or not MatKhau:
        return Response({"success": False, "error": "Vui lòng nhập số điện thoại và mật khẩu."}, 
                       status=status.HTTP_400_BAD_REQUEST)

    try:
        # Thêm log để debug
        print(f"Trước khi truy vấn database với SDTNV={SDTNV}")
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM taikhoan WHERE SDTNV = %s", [SDTNV])
            tai_khoan = dictfetchone(cursor)
            print(f"Kết quả tài khoản: {tai_khoan}")

        if tai_khoan is None:
            return Response({"success": False, "message": "Tài khoản không tồn tại"}, 
                          status=status.HTTP_404_NOT_FOUND)

        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM nhanvien WHERE SDTNV = %s", [SDTNV])
            nhan_vien = dictfetchone(cursor)

        if nhan_vien is None:
            return Response({"success": False, "message": "Không tìm thấy nhân viên."}, 
                          status=status.HTTP_404_NOT_FOUND)

        if not check_password(MatKhau, tai_khoan["MatKhauTK"]):
            return Response({"success": False, "message": "Sai mật khẩu"}, 
                          status=status.HTTP_401_UNAUTHORIZED)
        
        # Xác định quyền hạn dựa trên chức vụ
        is_admin = nhan_vien['IDChucVu'] == "1"  # "1" là mã của quản lý
        
        jwt_handler = JWTHandler()
        token = jwt_handler.generate_access_token(nhan_vien)

        print(f">>> Generated token: {token[:20]}...")
        
        # Trả về cả thông tin người dùng và quyền hạn tương tự auth.py
        return Response({
            "success": True,
            "user": {
                'id': nhan_vien['IDNhanVien'],
                'name': nhan_vien['TenNV'],
                'phone': nhan_vien['SDTNV'],
                'email': nhan_vien.get('EmailNV', ''),
                'role': "Quản lý" if is_admin else "Nhân viên",
                'permissions': {
                    'canView': True,  # Ai cũng có quyền xem
                    'canAdd': is_admin,
                    'canEdit': is_admin,
                    'canDelete': is_admin,
                }
            },
            "message": f"Đăng nhập thành công, chào {nhan_vien['TenNV']}",
            "access": token,
            "refresh": token,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        # Chi tiết lỗi để debug
        import traceback
        error_trace = traceback.format_exc()
        print(f"LOGIN ERROR: {str(e)}")
        print(error_trace)
        return Response({
            "success": False, 
            "message": str(e),
            "detail": error_trace
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
