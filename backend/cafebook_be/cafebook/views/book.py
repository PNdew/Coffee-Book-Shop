from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from ..permissions import IsAuthenticatedWithJWT

from ..models import Sach, TheLoai
from ..serializers import SachSerializer, TheLoaiSerializer
import re  # Thêm thư viện regex ở đầu file

# Create your views here.

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 1000
    page_size_query_param = 'page_size'
    max_page_size = 10000


class SachViewSet(viewsets.ModelViewSet):
    queryset = Sach.objects.all()
    serializer_class = SachSerializer
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['ten_sach', 'tac_gia']
    ordering_fields = ['ten_sach', 'tac_gia', 'so_luong_sach']
    ordering = ['ten_sach']
    permission_classes = [IsAuthenticatedWithJWT]

    def create(self, request, *args, **kwargs):
        data = request.data

        # Kiểm tra số lượng âm
        try:
            so_luong = int(data.get('so_luong_sach', 0))
            if so_luong < 0:
                return Response(
                    {"error": "Số lượng sách không được nhỏ hơn 0"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "Số lượng sách phải là số nguyên"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra tên sách
        ten_sach = data.get('ten_sach', '').strip()

        # Regex: chỉ cho phép chữ cái, số, khoảng trắng và một số ký tự cơ bản (.,-)
        if not re.match(r'^[\w\s\.,\-àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]+$', ten_sach, re.UNICODE):
            return Response(
                {"error": "Tên sách chứa ký tự không hợp lệ"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Sach.objects.filter(ten_sach__iexact=ten_sach).exists():
            return Response(
                {"error": f"Tên sách '{ten_sach}' đã tồn tại"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        data = request.data

        # Kiểm tra số lượng âm
        try:
            so_luong = int(data.get('so_luong_sach', 0))
            if so_luong < 0:
                return Response(
                    {"error": "Số lượng sách không được nhỏ hơn 0"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "Số lượng sách phải là số nguyên"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra tên sách
        ten_sach = data.get('ten_sach', '').strip()

        # Regex: chỉ cho phép chữ cái, số, khoảng trắng và một số ký tự cơ bản (.,-)
        if not re.match(r'^[\w\s\.,\-àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]+$', ten_sach, re.UNICODE):
            return Response(
                {"error": "Tên sách chứa ký tự không hợp lệ"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Sach.objects.filter(ten_sach__iexact=ten_sach).exists():
            return Response(
                {"error": f"Tên sách '{ten_sach}' đã tồn tại"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

class TheLoaiViewSet(viewsets.ModelViewSet):
    queryset = TheLoai.objects.all()
    serializer_class = TheLoaiSerializer
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['ten_the_loai']
    ordering_fields = ['ten_the_loai']
    ordering = ['ten_the_loai']
    permission_classes = [IsAuthenticatedWithJWT]  # Bỏ comment nếu cần xác thực
