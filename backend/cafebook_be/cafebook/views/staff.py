from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models.user import NhanVien
from ..models.rolls import ChucVu
from ..serializers import NhanVienSerializer, ChucVuSerializer

class NhanVienViewSet(viewsets.ModelViewSet):
    queryset = NhanVien.objects.all()
    serializer_class = NhanVienSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = NhanVien.objects.all()
        chuc_vu = self.request.query_params.get('chuc_vu', None)
        
        if chuc_vu is not None:
            queryset = queryset.filter(ChucVuNV=chuc_vu)
            
        return queryset

class ChucVuViewSet(viewsets.ModelViewSet):
    queryset = ChucVu.objects.all()
    serializer_class = ChucVuSerializer
    permission_classes = [AllowAny] 