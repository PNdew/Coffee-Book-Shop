from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework import viewsets, status, filters
from rest_framework.pagination import PageNumberPagination
from cafebook.models import NguyenLieu
from cafebook.serializers import NguyenLieuSerializer
from ..permissions import IsAuthenticatedWithJWT
import re  # Thêm thư viện regex ở đầu file

class NguyenLieuViewSet(viewsets.ModelViewSet):
    queryset = NguyenLieu.objects.all()
    serializer_class = NguyenLieuSerializer
    pagination_class = None  # Tắt hoàn toàn phân trang
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['ten_nguyen_lieu', 'so_luong']
    ordering_fields = ['ten_nguyen_lieu', 'so_luong', 'gia_nhap']
    ordering = ['ten_nguyen_lieu']
    permission_classes = [IsAuthenticatedWithJWT]  # Bỏ comment nếu cần xác thực

    def create(self, request, *args, **kwargs):
        data = request.data

        # Kiểm tra số lượng âm
        try:
            so_luong = int(data.get('so_luong', 0))
            if so_luong < 0:
                return Response(
                    {"error": "Số lượng nguyên liệu không được nhỏ hơn 0"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "Số lượng nguyên liệu phải là số nguyên"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            gia_nhap = int(data.get('gia_nhap', 0))
            if gia_nhap < 0:
                return Response(
                    {"error": "Giá nhập nguyên liệu không được nhỏ hơn 0"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "Giá nhập nguyên liệu phải là số nguyên"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Kiểm tra tên sách
        ten_nguyen_lieu = data.get('ten_nguyen_lieu', '').strip()

        # Regex: chỉ cho phép chữ cái, số, khoảng trắng và một số ký tự cơ bản (.,-)
        if not re.match(r'^[\w\s\.,\-àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]+$', ten_nguyen_lieu, re.UNICODE):
            return Response(
                {"error": "Tên nguyên liệu chứa ký tự không hợp lệ"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if NguyenLieu.objects.filter(ten_nguyen_lieu__iexact=ten_nguyen_lieu).exists():
            return Response(
                {"error": f"Nguyên liệu '{ten_nguyen_lieu}' đã tồn tại"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        data = request.data

        # Kiểm tra số lượng âm
        try:
            so_luong = int(data.get('so_luong', 0))
            if so_luong < 0:
                return Response(
                    {"error": "Số lượng nguyên liệu không được nhỏ hơn 0"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "Số lượng nguyên liệu phải là số nguyên"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            gia_nhap = int(data.get('gia_nhap', 0))
            if gia_nhap < 0:
                return Response(
                    {"error": "Giá nhập nguyên liệu không được nhỏ hơn 0"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "Giá nhập nguyên liệu phải là số nguyên"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Kiểm tra tên sách
        ten_nguyen_lieu = data.get('ten_nguyen_lieu', '').strip()

        # Regex: chỉ cho phép chữ cái, số, khoảng trắng và một số ký tự cơ bản (.,-)
        if not re.match(r'^[\w\s\.,\-àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]+$', ten_nguyen_lieu, re.UNICODE):
            return Response(
                {"error": "Tên nguyên liệu chứa ký tự không hợp lệ"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if NguyenLieu.objects.filter(ten_nguyen_lieu__iexact=ten_nguyen_lieu).exists():
            return Response(
                {"error": f"Nguyên liệu '{ten_nguyen_lieu}' đã tồn tại"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)