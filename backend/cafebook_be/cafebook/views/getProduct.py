from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from cafebook.models import Sanpham, Voucher, Donghoadon, Hoadon
from cafebook.serializers import SanphamSerializer, VoucherSerializer, DonghoadonSerializer, HoadonSerializer
from ..permissions import IsAuthenticatedWithJWT

# Sử dụng ViewSets
class SanphamViewSet(viewsets.ModelViewSet):
    queryset = Sanpham.objects.all()
    serializer_class = SanphamSerializer

class VoucherViewSet(viewsets.ModelViewSet):
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer

class HoadonViewSet(viewsets.ModelViewSet):
    queryset = Hoadon.objects.all()
    serializer_class = HoadonSerializer

class DonghoadonViewSet(viewsets.ModelViewSet):
    queryset = Donghoadon.objects.all()
    serializer_class = DonghoadonSerializer


    def perform_create(self, serializer):
        idhoadon = self.request.data.get('idhoadon')

        if idhoadon:
            # Đếm số dòng hiện có với idhoadon
            existing_lines = Donghoadon.objects.filter(idhoadon=idhoadon).count()
            serializer.save(sottdong=existing_lines + 1)
        else:
            raise serializer.ValidationError({"idhoadon": "Hóa đơn không được để trống"})

# Hoặc sử dụng function-based views
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