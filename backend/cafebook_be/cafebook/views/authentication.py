from django.db import connection
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

# Hàm chuyển kết quả từ cursor thành dict
def dictfetchone(cursor):
    columns = [col[0] for col in cursor.description]
    row = cursor.fetchone()
    if row is None:
        return None
    return dict(zip(columns, row))

@api_view(['POST'])
def login_view(request):
    if request.method != 'POST':
        return Response({"error": "Chỉ hỗ trợ phương thức POST."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    SDTNV = request.data.get('SDTNV')
    MatKhau = request.data.get('MatKhau')

    if not SDTNV or not MatKhau:
        return Response({"error": "Vui lòng nhập số điện thoại và mật khẩu."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Truy vấn tài khoản dựa trên SDTNV
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM taikhoan WHERE SDTNV = %s", [SDTNV])
            tai_khoan = dictfetchone(cursor)

        if tai_khoan is None:
            return Response({"error": "Số điện thoại không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        # Truy vấn nhân viên dựa trên SDTNV
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM nhanvien WHERE SDTNV = %s", [SDTNV])
            nhan_vien = dictfetchone(cursor)

        if nhan_vien is None:
            return Response({"error": "Không tìm thấy nhân viên."}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra mật khẩu
        if MatKhau == tai_khoan["MatKhauTK"]:
            return Response({
                "message": f"Đăng nhập thành công, chào {nhan_vien['TenNV']}",
                "tenNV": nhan_vien['TenNV'],
                "chucVuNV": nhan_vien['ChucVuNV'],
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Mật khẩu không đúng."}, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
