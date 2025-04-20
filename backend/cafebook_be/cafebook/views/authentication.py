import os
from django.db import connection
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth.hashers import check_password
from datetime import datetime, timedelta
from ..auth.jwt_handler import JWTHandler

# Sử dụng JWT_SECRET từ biến môi trường
JWT_SECRET = os.getenv('JWT_SECRET')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM')

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

    if not SDTNV or not MatKhau:
        return Response({"error": "Vui lòng nhập số điện thoại và mật khẩu."}, 
                       status=status.HTTP_400_BAD_REQUEST)

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM taikhoan WHERE SDTNV = %s", [SDTNV])
            tai_khoan = dictfetchone(cursor)

        if tai_khoan is None:
            return Response({"error": "Số điện thoại không tồn tại."}, 
                          status=status.HTTP_404_NOT_FOUND)

        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM nhanvien WHERE SDTNV = %s", [SDTNV])
            nhan_vien = dictfetchone(cursor)

        if nhan_vien is None:
            return Response({"error": "Không tìm thấy nhân viên."}, 
                          status=status.HTTP_404_NOT_FOUND)

        if not check_password(MatKhau, tai_khoan["MatKhauTK"]):
            return Response({"error": "Mật khẩu không đúng."}, 
                          status=status.HTTP_401_UNAUTHORIZED)
        
        # Sử dụng JWT Handler  
        jwt_handler = JWTHandler()
        access_token = jwt_handler.generate_access_token(nhan_vien)
        refresh_token = jwt_handler.generate_refresh_token(SDTNV)

        return Response({
            "message": f"Đăng nhập thành công, chào {nhan_vien['TenNV']}",
            "access": access_token,
            "refresh": refresh_token,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)
