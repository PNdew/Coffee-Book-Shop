from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from cafebook.models import Hoadon, Donghoadon, NhanVien, Sanpham, Voucher
from django.utils import timezone
from django.db import transaction
from cafebook.serializers import DonghoadonSerializer
from ..auth.get_user_token import get_user_from_token

@csrf_exempt
def createOrder(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Chỉ hỗ trợ POST'}, status=405)

    try:
        data = json.loads(request.body)
        idnhanvien = data.get('idnhanvien')

        if not idnhanvien:
            return JsonResponse({'error': 'idnhanvien là bắt buộc'}, status=400)

        try:
            nhanvien = NhanVien.objects.get(pk=idnhanvien)
        except NhanVien.DoesNotExist:
            return JsonResponse({'error': 'Nhân viên không tồn tại'}, status=404)

        hoadon = Hoadon.objects.create(
            ngayhd=timezone.now(),
            idnhanvien=nhanvien
        )

        return JsonResponse({'message': 'Tạo hóa đơn thành công', 'idhoadon': hoadon.idhoadon}, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def createOrderDetails(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Chỉ hỗ trợ POST'}, status=405)

    try:
        data = json.loads(request.body)

        idhoadon = data.get('orderId')
        items = data.get('items', [])
        activeVoucher = data.get('activeVoucher')

        if not idhoadon or not items:
            return JsonResponse({'error': 'Thiếu idhoadon hoặc danh sách sản phẩm'}, status=400)

        try:
            hoadon = Hoadon.objects.get(pk=idhoadon)
        except Hoadon.DoesNotExist:
            return JsonResponse({'error': 'Hóa đơn không tồn tại'}, status=404)

        with transaction.atomic():
            # Lấy số dòng đã tồn tại trước khi bắt đầu
            existing_lines = Donghoadon.objects.filter(idhoadon=hoadon).count()

            for index, item in enumerate(items):
                idsanpham = item.get('idsanpham')
                soluongsp = item.get('soluongsp')

                try:
                    sanpham = Sanpham.objects.get(pk=idsanpham)
                except Sanpham.DoesNotExist:
                    raise Exception(f"Sản phẩm ID {idsanpham} không tồn tại")

                voucher = None
                if activeVoucher:
                    try:
                        voucher = Voucher.objects.get(pk=activeVoucher.get('idvoucher'))
                    except Voucher.DoesNotExist:
                        raise Exception(f"Voucher ID {activeVoucher.get('idvoucher')} không tồn tại")

                line_data = {
                    'idhoadon': hoadon.idhoadon,
                    'sottdong': existing_lines + index + 1,  # ✅ mỗi dòng khác nhau
                    'idsanpham': sanpham.idsanpham,
                    'soluongsp': soluongsp,
                    'idvoucher': voucher.idvoucher if voucher else None
                }

                print("DEBUG:", line_data)

                serializer = DonghoadonSerializer(data=line_data)

                if serializer.is_valid():
                    serializer.save()
                else:
                    raise Exception(serializer.errors)

        return JsonResponse({'message': 'Đã thêm chi tiết đơn hàng thành công'}, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
