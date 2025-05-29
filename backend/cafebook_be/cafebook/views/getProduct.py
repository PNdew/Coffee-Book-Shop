from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from cafebook.models import Sanpham, Voucher, Donghoadon, Hoadon, NhanVien
from cafebook.serializers import SanphamSerializer, VoucherSerializer, DonghoadonSerializer, HoadonSerializer
from django.utils import timezone
from ..permissions import IsAuthenticatedWithJWT
from rest_framework.decorators import action
from django.db import connection
from ..cloudinary_service import upload_image_to_cloudinary
import re  # Thêm thư viện regex ở đầu file

class SanphamViewSet(viewsets.ModelViewSet):
    queryset = Sanpham.objects.all()
    serializer_class = SanphamSerializer
    permission_classes = [IsAuthenticatedWithJWT]

    def validate_sanpham_data(self, data, is_update=False, current_instance=None):
        # Kiểm tra tên sản phẩm
        ten_san_pham = data.get('tensp')
        if not ten_san_pham or not ten_san_pham.strip():
            raise ValueError("Tên sản phẩm không được để trống")
        ten_san_pham = ten_san_pham.strip()
        data['tensp'] = ten_san_pham

        if not re.match(r'^[\w\s\.,\-àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]+$', ten_san_pham, re.UNICODE):
            raise ValueError("Tên sản phẩm chứa ký tự không hợp lệ")

        # Kiểm tra trùng tên (bỏ qua nếu update và tên giống hiện tại)
        qs = Sanpham.objects.filter(tensp__iexact=ten_san_pham)
        if is_update and current_instance:
            qs = qs.exclude(idsanpham=current_instance.idsanpham)
        if qs.exists():
            raise ValueError(f"Tên sản phẩm '{ten_san_pham}' đã tồn tại")

        # Kiểm tra giá
        try:
            gia = float(data.get('giasp', 0))
        except (TypeError, ValueError):
            gia = -1
        if gia < 0:
            raise ValueError("Giá sản phẩm không được nhỏ hơn 0")

        return data

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            data = self.validate_sanpham_data(data)

            file = request.FILES.get("hinhanh")
            if file:
                data["hinhanh"] = upload_image_to_cloudinary(file)

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            return Response({
                "message": "Tạo sản phẩm thành công",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        except ValueError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Lỗi khi tạo sản phẩm: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()

        try:
            data = self.validate_sanpham_data(data, is_update=True, current_instance=instance)

            file = request.FILES.get("hinhanh")
            if file:
                data["hinhanh"] = upload_image_to_cloudinary(file)

            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            return Response({
                "message": "Cập nhật sản phẩm thành công",
                "data": serializer.data
            })

        except ValueError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Lỗi khi cập nhật sản phẩm: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class HoadonViewSet(viewsets.ModelViewSet):
    queryset = Hoadon.objects.all().order_by('-ngayhd')
    serializer_class = HoadonSerializer
    permission_classes = [IsAuthenticatedWithJWT]
    
    @action(detail=True, methods=['get'])
    def dong_hoa_don(self, request, pk=None):
        """Lấy tất cả dòng hóa đơn của một hóa đơn cụ thể"""
        try:
            hoadon = self.get_object()
            
            # Sử dụng raw query để lấy dữ liệu chính xác
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT dh.SoTTDong, dh.IDSanPham, dh.SoLuongSP, dh.GhiChu, dh.IDVoucher,
                           sp.tensp, sp.giasp, sp.loaisp
                    FROM donghoadon dh
                    JOIN sanpham sp ON dh.IDSanPham = sp.idsanpham
                    WHERE dh.IDHoaDon = %s
                    ORDER BY dh.SoTTDong
                """, [pk])
                dong_hoa_don_data = cursor.fetchall()
            
            # Nếu không có dữ liệu
            if not dong_hoa_don_data:
                print(f"Không tìm thấy dòng hóa đơn nào cho hóa đơn {pk}")
                return Response([])
            
            # Chuyển đổi dữ liệu từ raw query thành format phù hợp với API
            result = []
            for row in dong_hoa_don_data:
                so_tt_dong, id_san_pham, so_luong_sp, ghi_chu, id_voucher, ten_sp, gia_sp, loai_sp = row
                
                # Lấy thông tin voucher nếu có
                voucher_info = None
                if id_voucher:
                    try:
                        voucher = Voucher.objects.get(idvoucher=id_voucher)
                        voucher_info = VoucherSerializer(voucher).data
                    except Voucher.DoesNotExist:
                        pass
                
                # Tạo cấu trúc dữ liệu dòng hóa đơn
                dong_hoa_don_item = {
                    'idhoadon': int(pk),
                    'sottdong': so_tt_dong,
                    'idsanpham': id_san_pham,
                    'soluongsp': so_luong_sp,
                    'ghichu': ghi_chu,
                    'idvoucher': id_voucher,
                    'sanpham_info': {
                        'idsanpham': id_san_pham,
                        'tensp': ten_sp,
                        'giasp': float(gia_sp) if gia_sp else 0,
                        'loaisp': loai_sp
                    },
                    'voucher_info': voucher_info
                }
                result.append(dong_hoa_don_item)
            
            return Response(result)
        except Exception as e:
            print(f"Lỗi khi lấy dòng hóa đơn: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def insert_test_data(self, request):
        """Thêm dữ liệu mẫu cho hóa đơn và dòng hóa đơn"""
        try:
            # Lấy nhân viên đầu tiên
            try:
                nhanvien = NhanVien.objects.first()
                if not nhanvien:
                    return Response({"error": "Không có nhân viên nào trong hệ thống"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": f"Lỗi khi tìm nhân viên: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Lấy sản phẩm
            sanpham_ids = []
            sanphams = Sanpham.objects.all()[:5]
            for sanpham in sanphams:
                sanpham_ids.append(sanpham.idsanpham)
            
            if not sanpham_ids:
                return Response({"error": "Không có sản phẩm nào trong hệ thống"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Tạo hóa đơn
            hoadon = Hoadon.objects.create(
                ngayhd=timezone.now(),
                idnhanvien=nhanvien
            )
            
            # Tạo các dòng hóa đơn
            for i, sanpham_id in enumerate(sanpham_ids, 1):
                sanpham = Sanpham.objects.get(idsanpham=sanpham_id)
                soluong = i  # Số lượng mẫu
                Donghoadon.objects.create(
                    idhoadon=hoadon,
                    sottdong=i,
                    idsanpham=sanpham,
                    soluongsp=soluong,
                    ghichu=f"Ghi chú cho sản phẩm {i}"
                )
            
            return Response({
                "message": "Đã thêm dữ liệu mẫu hóa đơn thành công",
                "idhoadon": hoadon.idhoadon
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DonghoadonViewSet(viewsets.ModelViewSet):
    queryset = Donghoadon.objects.all()
    serializer_class = DonghoadonSerializer
    permission_classes = [IsAuthenticatedWithJWT]

    def perform_create(self, serializer):
        idhoadon = self.request.data.get('idhoadon')

        if idhoadon:
            # Đếm số dòng hiện có với idhoadon để tạo số thứ tự dòng mới
            existing_lines = Donghoadon.objects.filter(idhoadon=idhoadon).count()
            # Sử dụng existing_lines để tạo số thứ tự dòng (SoTTDong)
            serializer.save(idhoadon_id=idhoadon, sottdong=existing_lines + 1)
        else:
            raise serializer.ValidationError({"idhoadon": "Hóa đơn không được để trống"})

    def get_queryset(self):
        """
        Lọc queryset theo các tham số nếu có
        """
        queryset = Donghoadon.objects.all()
        
        # Lọc theo hóa đơn nếu có tham số idhoadon
        idhoadon = self.request.query_params.get('idhoadon')
        if idhoadon:
            queryset = queryset.filter(idhoadon__idhoadon=idhoadon)
            
        # Lọc theo sản phẩm nếu có tham số idsanpham
        idsanpham = self.request.query_params.get('idsanpham')
        if idsanpham:
            queryset = queryset.filter(idsanpham__idsanpham=idsanpham)
            
        return queryset.order_by('idhoadon__idhoadon', 'sottdong')
        
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
