from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from cafebook.models import NguyenLieu
from cafebook.serializers import NguyenLieuSerializer
from ..permissions import IsAuthenticatedWithJWT
import re

class NguyenLieuViewSet(viewsets.ModelViewSet):
    queryset = NguyenLieu.objects.all()
    serializer_class = NguyenLieuSerializer
    pagination_class = None  # Tắt phân trang
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['ten_nguyen_lieu', 'so_luong']
    ordering_fields = ['ten_nguyen_lieu', 'so_luong', 'gia_nhap']
    ordering = ['ten_nguyen_lieu']
    permission_classes = [IsAuthenticatedWithJWT]

    def validate_data(self, data, instance_id=None):
        ten_nguyen_lieu = data.get('ten_nguyen_lieu', '').strip()
        gia_nhap = data.get('gia_nhap', None)

        # 1. Kiểm tra tên nguyên liệu rỗng
        if not ten_nguyen_lieu:
            return {"error": "Tên nguyên liệu không được để trống"}

        # 2. Kiểm tra ký tự không hợp lệ
        if not re.match(r'^[\w\s\.,\-àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]+$', ten_nguyen_lieu, re.UNICODE):
            return {"error": "Tên nguyên liệu chứa ký tự không hợp lệ"}

        # 3. Kiểm tra trùng tên nguyên liệu (case-insensitive)
        queryset = NguyenLieu.objects.filter(ten_nguyen_lieu__iexact=ten_nguyen_lieu)
        if instance_id:
            queryset = queryset.exclude(id=instance_id)
        if queryset.exists():
            return {"error": f"Nguyên liệu '{ten_nguyen_lieu}' đã tồn tại"}

        # 4. Kiểm tra gia_nhap là số nguyên >= 0
        try:
            gia_nhap = int(gia_nhap)
            if gia_nhap < 0:
                return {"error": "Giá nhập nguyên liệu không được nhỏ hơn 0"}
        except (ValueError, TypeError):
            return {"error": "Giá nhập nguyên liệu phải là số nguyên"}

        return None  # Không có lỗi

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
