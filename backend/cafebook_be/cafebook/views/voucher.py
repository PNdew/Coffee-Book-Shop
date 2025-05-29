from rest_framework import viewsets
from cafebook.models import Voucher
from cafebook.serializers import VoucherSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.forms.models import model_to_dict
from datetime import datetime
from rest_framework import filters

# ViewSet để hiển thị danh sách Voucher
class VoucherViewSet(viewsets.ModelViewSet):
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['ten_voucher', 'loaisp']
    ordering_fields = ['ten_voucher', 'loaisp']
    ordering = ['ten_voucher', 'loaisp']
    # permission_classes = [IsAuthenticated]  # Bỏ comment nếu cần xác thựcc
