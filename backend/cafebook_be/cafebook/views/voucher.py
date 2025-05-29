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
    permission_classes = [IsAuthenticatedWithJWT]

    def validate_voucher_data(self, data, is_update=False, instance=None):
        errors = {}
        ten_voucher = data.get('tenvoucher', '').strip()

        if not ten_voucher:
            errors['tenvoucher'] = "Tên voucher không được để trống"
        elif not re.match(r'^[\w\s\.,\-àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ%]+$', ten_voucher, re.UNICODE):
            errors['tenvoucher'] = "Tên voucher chứa ký tự không hợp lệ"
        else:
            # Kiểm tra trùng tên
            qs = Voucher.objects.filter(tenvoucher__iexact=ten_voucher)
            if is_update and instance:
                qs = qs.exclude(idvoucher=instance.idvoucher)
            if qs.exists():
                errors['tenvoucher'] = f"Tên voucher '{ten_voucher}' đã tồn tại"
        data['tenvoucher'] = ten_voucher

        # Kiểm tra thời gian bắt đầu và kết thúc
        try:
            tg_bat_dau_str = data.get('thoigianbatdauvoucher')
            tg_ket_thuc_str = data.get('thoigianketthucvoucher')

            if not tg_bat_dau_str:
                if is_update and instance:
                    thoi_gian_bat_dau = instance.thoigianbatdauvoucher
                else:
                    raise ValueError("Thiếu thời gian bắt đầu")
            else:
                thoi_gian_bat_dau = datetime.strptime(tg_bat_dau_str, '%Y-%m-%dT%H:%M:%S.%fZ')

            if not tg_ket_thuc_str:
                if is_update and instance:
                    thoi_gian_ket_thuc = instance.thoigianketthucvoucher
                else:
                    raise ValueError("Thiếu thời gian kết thúc")
            else:
                thoi_gian_ket_thuc = datetime.strptime(tg_ket_thuc_str, '%Y-%m-%dT%H:%M:%S.%fZ')

            if thoi_gian_bat_dau >= thoi_gian_ket_thuc:
                errors['thoigian'] = "Thời gian kết thúc phải sau thời gian bắt đầu"

            data['thoigianbatdauvoucher'] = thoi_gian_bat_dau
            data['thoigianketthucvoucher'] = thoi_gian_ket_thuc

        except ValueError as e:
            errors['thoigian'] = f"Định dạng thời gian không hợp lệ: {e}"

        # Kiểm tra giảm giá
        try:
            giam_gia = float(data.get('giamgia', ''))
            if giam_gia <= 0 or giam_gia > 100:
                errors['giamgia'] = "Giảm giá phải lớn hơn 0 và nhỏ hơn hoặc bằng 100"
            data['giamgia'] = giam_gia
        except (ValueError, TypeError):
            errors['giamgia'] = "Giảm giá phải là số"

        if errors:
            raise ValueError(errors)

        return data

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            data = self.validate_voucher_data(data)

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response({
                "message": "Tạo voucher thành công",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        except ValueError as ve:
            return Response({"error": ve.args[0]}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Lỗi khi tạo voucher: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            data = request.data.copy()
            data = self.validate_voucher_data(data, is_update=True, instance=instance)

            serializer = self.get_serializer(instance, data=data, partial=kwargs.get('partial', False))
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response({
                "message": "Cập nhật voucher thành công",
                "data": serializer.data
            })
        except ValueError as ve:
            return Response({"error": ve.args[0]}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Lỗi khi cập nhật voucher: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
