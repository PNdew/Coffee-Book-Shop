from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from ..models import Sach, TheLoai
from ..serializers import SachSerializer, TheLoaiSerializer

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
    # permission_classes = [IsAuthenticated]  # Bỏ comment nếu cần xác thực

class TheLoaiViewSet(viewsets.ModelViewSet):
    queryset = TheLoai.objects.all()
    serializer_class = TheLoaiSerializer
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['ten_the_loai']
    ordering_fields = ['ten_the_loai']
    ordering = ['ten_the_loai']
    # permission_classes = [IsAuthenticated]  # Bỏ comment nếu cần xác thực
