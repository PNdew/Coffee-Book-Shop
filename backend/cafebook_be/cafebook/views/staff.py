from rest_framework import viewsets, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models.user import NhanVien
from ..models.rolls import ChucVu
from ..serializers import NhanVienSerializer, ChucVuSerializer
from ..permissions import IsAuthenticatedWithJWT
import re

class NhanVienViewSet(viewsets.ModelViewSet):
    queryset = NhanVien.objects.all()
    serializer_class = NhanVienSerializer
    permission_classes = [IsAuthenticatedWithJWT] 
    
    def get_queryset(self):
        queryset = NhanVien.objects.all()
        chuc_vu = self.request.query_params.get('chuc_vu', None)
        
        if chuc_vu is not None:
            queryset = queryset.filter(ChucVuNV=chuc_vu)
            
        return queryset

    def update(self, request, *args, **kwargs):
        data = request.data
        ten_nv = data.get('TenNV', '').strip()

        # Regex: chỉ cho phép chữ cái, số, khoảng trắng và một số ký tự cơ bản (.,-)
        if not re.match(r'^[\w\s\.,\-àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]+$', ten_nv, re.UNICODE):
            return Response(
                {"error": "Tên nhân viên chứa ký tự không hợp lệ"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)

class ChucVuViewSet(viewsets.ModelViewSet):
    queryset = ChucVu.objects.all()
    serializer_class = ChucVuSerializer
    permission_classes = [IsAuthenticatedWithJWT] 