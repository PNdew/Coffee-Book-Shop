from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from cafebook.models import Sanpham, Voucher, Donghoadon, Hoadon, NhanVien
from cafebook.serializers import SanphamSerializer, VoucherSerializer, DonghoadonSerializer, HoadonSerializer
from django.utils import timezone
from django.db import transaction
from ..permissions import IsAuthenticatedWithJWT

# ViewSets mặc định cho các model đơn
class SanphamViewSet(viewsets.ModelViewSet):
    queryset = Sanpham.objects.all()
    serializer_class = SanphamSerializer
    # permission_classes = [IsAuthenticatedWithJWT]

class VoucherViewSet(viewsets.ModelViewSet):
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    # permission_classes = [IsAuthenticatedWithJWT]

class HoadonViewSet(viewsets.ModelViewSet):
    queryset = Hoadon.objects.all()
    serializer_class = HoadonSerializer
    # permission_classes = [IsAuthenticatedWithJWT]

class DonghoadonViewSet(viewsets.ModelViewSet):
    queryset = Donghoadon.objects.all()
    serializer_class = DonghoadonSerializer
    # permission_classes = [IsAuthenticatedWithJWT]
    def perform_create(self, serializer):
        idhoadon = self.request.data.get('idhoadon')

        if idhoadon:
            # Đếm số dòng hiện có với idhoadon để tạo số thứ tự dòng mới
            existing_lines = Donghoadon.objects.filter(idhoadon=idhoadon).count()
            # Sử dụng existing_lines để tạo số thứ tự dòng (SoTTDong)
            serializer.save(idhoadon_id=idhoadon, sottdong=existing_lines + 1)
        else:
            raise serializer.ValidationError({"idhoadon": "Hóa đơn không được để trống"})

# Các API đơn giản khác
@api_view(['GET'])
def get_sanpham_list(request):
    sanphams = Sanpham.objects.all()
    serializer = SanphamSerializer(sanphams, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_sanpham_detail(request, pk):
    try:
        sanpham = Sanpham.objects.get(idsanpham=pk)
        serializer = SanphamSerializer(sanpham)
        return Response(serializer.data)
    except Sanpham.DoesNotExist:
        return Response({'error': 'Sản phẩm không tồn tại'}, status=404)

@api_view(['GET'])
def get_donghoadon_by_voucher(request, voucher_id):
    donghoadons = Donghoadon.objects.filter(voucher__idvoucher=voucher_id)
    serializer = DonghoadonSerializer(donghoadons, many=True)
    return Response(serializer.data)
