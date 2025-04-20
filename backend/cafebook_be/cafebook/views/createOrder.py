from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from cafebook.models import Hoadon, Donghoadon, NhanVien, Sanpham, Voucher
from django.utils import timezone
from django.db import transaction

@csrf_exempt
def createOrder(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Chỉ hỗ trợ POST'}, status=405)

    try:
        data = json.loads(request.body)

        idnhanvien = data.get('idnhanvien')
        lines = data.get('lines', [])

        if not idnhanvien:
            return JsonResponse({'error': 'idnhanvien là bắt buộc'}, status=400)

        if not lines:
            return JsonResponse({'error': 'Danh sách sản phẩm trống'}, status=400)

        # Lấy nhân viên
        try:
            nhanvien = NhanVien.objects.get(pk=idnhanvien)
        except NhanVien.DoesNotExist:
            return JsonResponse({'error': 'Nhân viên không tồn tại'}, status=404)

        with transaction.atomic():
            # Tạo hóa đơn mới
            hoadon = Hoadon.objects.create(
                ngayhd=timezone.now(),
                idnhanvien=nhanvien
            )

            # Tạo dòng hóa đơn
            for line in lines:
                idsanpham = line.get('idsanpham')
                soluongsp = line.get('soluongsp')
                idvoucher = line.get('idvoucher', None)

                try:
                    sanpham = Sanpham.objects.get(pk=idsanpham)
                except Sanpham.DoesNotExist:
                    raise Exception(f"Sản phẩm ID {idsanpham} không tồn tại")

                voucher = None
                if idvoucher:
                    try:
                        voucher = Voucher.objects.get(pk=idvoucher)
                    except Voucher.DoesNotExist:
                        raise Exception(f"Voucher ID {idvoucher} không tồn tại")

                Donghoadon.objects.create(
                    idhoadon=hoadon,
                    sanpham=sanpham,
                    soluongsp=soluongsp,
                    voucher=voucher
                )

        return JsonResponse({'message': 'Tạo hóa đơn thành công', 'idhoadon': hoadon.idhoadon}, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
