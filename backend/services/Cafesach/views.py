from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth.hashers import check_password
from .models import TaiKhoan, NhanVien

@api_view(['POST'])
def login_view(request):
    # Kiểm tra request có phải là POST không
    if request.method != 'POST':
        return Response({"error": "Chỉ hỗ trợ phương thức POST."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    SDTNV = request.data.get('SDTNV')
    MatKhau = request.data.get('MatKhau')

    if not SDTNV or not MatKhau:
        return Response({"error": "Vui lòng nhập số điện thoại và mật khẩu."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        tai_khoan = TaiKhoan.objects.get(SDTNV=SDTNV)
        nhan_vien = NhanVien.objects.get(SDTNV=SDTNV)
        if MatKhau == tai_khoan.MatKhauTK:
            return Response({"message": "Đăng nhập thành công, chào " + nhan_vien.TenNV, "tenNV": nhan_vien.TenNV, "chucVuNV": nhan_vien.ChucVuNV}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Mật khẩu không đúng."}, status=status.HTTP_401_UNAUTHORIZED)
    except TaiKhoan.DoesNotExist:
        return Response({"error": "Số điện thoại không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
