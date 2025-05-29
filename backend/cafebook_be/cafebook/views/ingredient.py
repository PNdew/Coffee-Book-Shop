from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from cafebook.models import NguyenLieu
from cafebook.serializers import NguyenLieuSerializer
from ..permissions import IsAuthenticatedWithJWT

class NguyenLieuViewSet(viewsets.ModelViewSet):
    queryset = NguyenLieu.objects.all()
    serializer_class = NguyenLieuSerializer
    pagination_class = None  # Tắt hoàn toàn phân trang
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['ten_nguyen_lieu', 'so_luong']
    ordering_fields = ['ten_nguyen_lieu', 'so_luong', 'gia_nhap']
    ordering = ['ten_nguyen_lieu']
    permission_classes = [IsAuthenticatedWithJWT]  # Bỏ comment nếu cần xác thực