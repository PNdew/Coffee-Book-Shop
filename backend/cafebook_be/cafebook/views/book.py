from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from ..permissions import IsAuthenticatedWithJWT

from ..models import Sach, TheLoai
from ..serializers import SachSerializer, TheLoaiSerializer
import re

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

    def validate_data(self, data, instance_id=None):
        ten_sach = data.get('ten_sach', '').strip()
        tac_gia = data.get('tac_gia', '').strip()
        so_luong_sach = data.get('so_luong_sach', None)

        if not ten_sach:
            return {"error": "Tên sách không được để trống"}

        if not tac_gia:
            return {"error": "Tên tác giả không được để trống"}

        if not re.match(r'^[\w\s\.,\-àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]+$', ten_sach, re.UNICODE):
            return {"error": "Tên sách chứa ký tự không hợp lệ"}

        try:
            so_luong_sach = int(so_luong_sach)
            if so_luong_sach < 0:
                return {"error": "Số lượng sách không được nhỏ hơn 0"}
        except (ValueError, TypeError):
            return {"error": "Số lượng sách phải là số nguyên"}

        queryset = Sach.objects.filter(ten_sach__iexact=ten_sach)
        if instance_id:
            queryset = queryset.exclude(id=instance_id)
        if queryset.exists():
            return {"error": f"Tên sách '{ten_sach}' đã tồn tại"}

        return None  

    def create(self, request, *args, **kwargs):
        error = self.validate_data(request.data)
        if error:
            return Response(error, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        error = self.validate_data(request.data, instance_id=instance.id)
        if error:
            return Response(error, status=status.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)

class TheLoaiViewSet(viewsets.ModelViewSet):
    queryset = TheLoai.objects.all()
    serializer_class = TheLoaiSerializer
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['ten_the_loai']
    ordering_fields = ['ten_the_loai']
    ordering = ['ten_the_loai']
    # permission_classes = [IsAuthenticated]  # Bỏ comment nếu cần xác thực