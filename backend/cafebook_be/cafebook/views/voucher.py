from rest_framework import viewsets, status
from cafebook.models import Voucher
from cafebook.serializers import VoucherSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.forms.models import model_to_dict
from datetime import datetime
from rest_framework import filters
from ..permissions import IsAuthenticatedWithJWT
import re

# ViewSet để hiển thị danh sách Voucher
class VoucherViewSet(viewsets.ModelViewSet):
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tenvoucher', 'loaisp']
    ordering_fields = ['tenvoucher', 'loaisp']
    ordering = ['tenvoucher', 'loaisp']
    permission_classes = [IsAuthenticatedWithJWT]  # Bỏ comment nếu cần xác thựcc

    def create(self, request, *args, **kwargs):
        data = request.data
        ten_voucher = data.get('tenvoucher', '').strip()

        # Kiểm tra tên voucher
        if not re.match(r'^[\w\s\.,\-àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ%s]+$', ten_voucher, re.UNICODE):
            return Response(
                {"error": "Tên voucher chứa ký tự không hợp lệ"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra tên voucher đã tồn tại chưa
        if Voucher.objects.filter(tenvoucher__iexact=ten_voucher).exists():
            return Response(
                {"error": f"Tên voucher '{ten_voucher}' đã tồn tại"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra thời gian
        try:
            thoi_gian_bat_dau = datetime.strptime(data.get('thoigianbatdauvoucher'), '%Y-%m-%dT%H:%M:%S.%fZ')
            thoi_gian_ket_thuc = datetime.strptime(data.get('thoigianketthucvoucher'), '%Y-%m-%dT%H:%M:%S.%fZ')
            
            if thoi_gian_bat_dau >= thoi_gian_ket_thuc:
                return Response(
                    {"error": "Thời gian kết thúc phải sau thời gian bắt đầu"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "Định dạng thời gian không hợp lệ"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra giảm giá
        try:
            giam_gia = float(data.get('giamgia', 0))
            if giam_gia <= 0 or giam_gia > 100:
                return Response(
                    {"error": "Giảm giá phải lớn hơn 0 và nhỏ hơn hoặc bằng 100"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "Giảm giá phải là số"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        data = request.data
        ten_voucher = data.get('tenvoucher', '').strip()

        # Kiểm tra tên voucher
        if not re.match(r'^[\w\s\.,\-àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ%]+$', ten_voucher, re.UNICODE):
            return Response(
                {"error": "Tên voucher chứa ký tự không hợp lệ"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra tên voucher đã tồn tại chưa (trừ voucher hiện tại)
        instance = self.get_object()
        if Voucher.objects.filter(tenvoucher__iexact=ten_voucher).exclude(idvoucher=instance.idvoucher).exists():
            return Response(
                {"error": f"Tên voucher '{ten_voucher}' đã tồn tại"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra thời gian
        try:
            thoi_gian_bat_dau = datetime.strptime(data.get('thoigianbatdauvoucher'), '%Y-%m-%dT%H:%M:%S.%fZ')
            thoi_gian_ket_thuc = datetime.strptime(data.get('thoigianketthucvoucher'), '%Y-%m-%dT%H:%M:%S.%fZ')
            
            if thoi_gian_bat_dau >= thoi_gian_ket_thuc:
                return Response(
                    {"error": "Thời gian kết thúc phải sau thời gian bắt đầu"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "Định dạng thời gian không hợp lệ"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra giảm giá
        try:
            giam_gia = float(data.get('giamgia', 0))
            if giam_gia <= 0 or giam_gia > 100:
                return Response(
                    {"error": "Giảm giá phải lớn hơn 0 và nhỏ hơn hoặc bằng 100"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "Giảm giá phải là số"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)
