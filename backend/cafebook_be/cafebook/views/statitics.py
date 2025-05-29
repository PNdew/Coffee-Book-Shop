from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, F, ExpressionWrapper, DecimalField
from datetime import datetime, timedelta
import calendar

from cafebook.models import HoaDon, DongHoaDon
from cafebook.serializers import StatisticsSerializer

class StatisticsView(APIView):
    def get(self, request):
        loai_thong_ke = request.query_params.get('type', 'day')
        ngay_str = request.query_params.get('date', datetime.now().strftime('%Y-%m-%d'))

        try:
            if loai_thong_ke == 'day':
                return self.thong_ke_ngay(ngay_str)
            elif loai_thong_ke == 'week':
                return self.thong_ke_tuan(ngay_str)
            elif loai_thong_ke == 'month':
                return self.thong_ke_thang(ngay_str)
            else:
                return Response({"error": "Tham số 'type' không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Định dạng ngày không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

    def thong_ke_ngay(self, ngay_str):
        ngay = datetime.strptime(ngay_str, '%Y-%m-%d').date()
        HoaDon_trong_ngay = HoaDon.objects.filter(ngayhd__date=ngay)

        tong_so_HoaDon = HoaDon_trong_ngay.count()
        tong_doanh_thu = DongHoaDon.objects.filter(idHoaDon__ngayhd__date=ngay) \
            .annotate(tong_tien=ExpressionWrapper(F('soluongsp') * F('idsanpham__giasp'), output_field=DecimalField())) \
            .aggregate(tong=Sum('tong_tien'))['tong'] or 0

        dong_HoaDon = DongHoaDon.objects.filter(idHoaDon__ngayhd__date=ngay).select_related('idsanpham')

        tong_san_pham = dong_HoaDon.aggregate(tong=Sum('soluongsp'))['tong'] or 0
        tong_thuc_uong = dong_HoaDon.filter(idsanpham__loaisp='DoUong').aggregate(tong=Sum('soluongsp'))['tong'] or 0
        tong_do_an = dong_HoaDon.filter(idsanpham__loaisp='DoAn').aggregate(tong=Sum('soluongsp'))['tong'] or 0

        thuc_uong_ban_chay = dong_HoaDon.filter(idsanpham__loaisp='DoUong') \
            .values('idsanpham__idsanpham', 'idsanpham__tensp') \
            .annotate(tong=Sum('soluongsp')) \
            .order_by('-tong') \
            .first()

        do_an_ban_chay = dong_HoaDon.filter(idsanpham__loaisp='DoAn') \
            .values('idsanpham__idsanpham', 'idsanpham__tensp') \
            .annotate(tong=Sum('soluongsp')) \
            .order_by('-tong') \
            .first()

        du_lieu = {
            'tong_hoa_don': tong_so_HoaDon,
            'tong_doanh_thu': tong_doanh_thu,
            'tong_san_pham_ban': tong_san_pham,
            'tong_thuc_uong_ban': tong_thuc_uong,
            'tong_do_an_ban': tong_do_an,
            'thuc_uong_ban_chay': thuc_uong_ban_chay['idsanpham__tensp'] if thuc_uong_ban_chay else None,
            'do_an_ban_chay': do_an_ban_chay['idsanpham__tensp'] if do_an_ban_chay else None,
        }
        serializer = StatisticsSerializer(du_lieu)
        return Response(serializer.data)

    def thong_ke_tuan(self, ngay_str):
        ngay = datetime.strptime(ngay_str, '%Y-%m-%d').date()
        dau_tuan = ngay - timedelta(days=ngay.weekday())
        cuoi_tuan = dau_tuan + timedelta(days=6)

        hoa_don = HoaDon.objects.filter(ngayhd__date__range=[dau_tuan, cuoi_tuan])
        tong_hoa_don = hoa_don.count()

        dong_HoaDon = DongHoaDon.objects.filter(idHoaDon__ngayhd__date__range=[dau_tuan, cuoi_tuan])
        tong_doanh_thu = dong_HoaDon \
            .annotate(tong_tien=ExpressionWrapper(F('soluongsp') * F('idsanpham__giasp'), output_field=DecimalField())) \
            .aggregate(tong=Sum('tong_tien'))['tong'] or 0

        tong_san_pham = dong_HoaDon.aggregate(tong=Sum('soluongsp'))['tong'] or 0
        tong_thuc_uong = dong_HoaDon.filter(idsanpham__loaisp='DoUong').aggregate(tong=Sum('soluongsp'))['tong'] or 0
        tong_do_an = dong_HoaDon.filter(idsanpham__loaisp='DoAn').aggregate(tong=Sum('soluongsp'))['tong'] or 0

        # Biểu đồ doanh thu từng ngày trong tuần
        du_lieu_doanh_thu = []
        nhan = [(dau_tuan + timedelta(days=i)).strftime('%d/%m') for i in range(7)]
        for i in range(7):
            ngay_trong_tuan = dau_tuan + timedelta(days=i)
            doanh_thu_ngay = DongHoaDon.objects.filter(idHoaDon__ngayhd__date=ngay_trong_tuan) \
                .annotate(tong_tien=ExpressionWrapper(F('soluongsp') * F('idsanpham__giasp'), output_field=DecimalField())) \
                .aggregate(tong=Sum('tong_tien'))['tong'] or 0
            du_lieu_doanh_thu.append(doanh_thu_ngay)

        bieu_do_doanh_thu = {
            'nhan': nhan,
            'du_lieu': [{
                'data': du_lieu_doanh_thu,
                'color': 'rgba(134, 65, 244, 1)',
                'strokeWidth': 2
            }],
            'chu_thich': ['Doanh thu theo ngày']
        }

        # Top 5 sản phẩm
        top_san_pham = dong_HoaDon \
            .values('idsanpham__tensp') \
            .annotate(soluong=Sum('soluongsp')) \
            .order_by('-soluong')[:5]

        mau_sac = [
            'rgba(131, 167, 234, 1)', 'rgba(255, 165, 180, 1)', 'rgba(131, 227, 234, 1)',
            'rgba(255, 195, 100, 1)', 'rgba(179, 134, 255, 1)'
        ]

        bieu_do_tron = [
            {
                'ten': sp['idsanpham__tensp'],
                'so_luong': sp['soluong'],
                'mau_sac': mau_sac[i % len(mau_sac)],
                'mau_chu_chu_thich': '#7F7F7F',
                'co_chu_chu_thich': 12
            } for i, sp in enumerate(top_san_pham)
        ]

        # Sản phẩm DoUong và DoAn bán chạy nhất
        thuc_uong_ban_chay = dong_HoaDon.filter(idsanpham__loaisp='DoUong') \
            .values('idsanpham__tensp') \
            .annotate(tong=Sum('soluongsp')) \
            .order_by('-tong').first()

        do_an_ban_chay = dong_HoaDon.filter(idsanpham__loaisp='DoAn') \
            .values('idsanpham__tensp') \
            .annotate(tong=Sum('soluongsp')) \
            .order_by('-tong').first()

        du_lieu = {
            'tong_hoa_don': tong_hoa_don,
            'tong_doanh_thu': tong_doanh_thu,
            'tong_san_pham_ban': tong_san_pham,
            'tong_thuc_uong_ban': tong_thuc_uong,
            'tong_do_an_ban': tong_do_an,
            'bieu_do_doanh_thu': bieu_do_doanh_thu,
            'bieu_do_tron': bieu_do_tron,
            'thuc_uong_ban_chay': thuc_uong_ban_chay['idsanpham__tensp'] if thuc_uong_ban_chay else None,
            'do_an_ban_chay': do_an_ban_chay['idsanpham__tensp'] if do_an_ban_chay else None,
        }
        serializer = StatisticsSerializer(du_lieu)
        return Response(serializer.data)

    def thong_ke_thang(self, ngay_str):
        ngay = datetime.strptime(ngay_str, '%Y-%m-%d').date()
        thang = ngay.month
        nam = ngay.year
        _, cuoi_thang = calendar.monthrange(nam, thang)

        dau_thang = ngay.replace(day=1)
        cuoi_thang = ngay.replace(day=cuoi_thang)

        hoa_don = HoaDon.objects.filter(ngayhd__date__range=[dau_thang, cuoi_thang])
        dong_HoaDon = DongHoaDon.objects.filter(idHoaDon__ngayhd__date__range=[dau_thang, cuoi_thang])

        tong_hoa_don = hoa_don.count()
        tong_doanh_thu = dong_HoaDon.annotate(
            tong_tien=ExpressionWrapper(F('soluongsp') * F('idsanpham__giasp'), output_field=DecimalField())
        ).aggregate(tong=Sum('tong_tien'))['tong'] or 0

        tong_san_pham = dong_HoaDon.aggregate(tong=Sum('soluongsp'))['tong'] or 0
        tong_thuc_uong = dong_HoaDon.filter(idsanpham__loaisp='DoUong').aggregate(tong=Sum('soluongsp'))['tong'] or 0
        tong_do_an = dong_HoaDon.filter(idsanpham__loaisp='DoAn').aggregate(tong=Sum('soluongsp'))['tong'] or 0

        # Biểu đồ doanh thu từng tháng trong năm
        du_lieu_doanh_thu = []
        nhan = [f'T{m}' for m in range(1, 13)]

        for m in range(1, 13):
            doanh_thu_thang = DongHoaDon.objects.filter(
                idHoaDon__ngayhd__year=nam,
                idHoaDon__ngayhd__month=m
            ).annotate(tong_tien=ExpressionWrapper(
                F('soluongsp') * F('idsanpham__giasp'),
                output_field=DecimalField()
            )).aggregate(tong=Sum('tong_tien'))['tong'] or 0

            du_lieu_doanh_thu.append(doanh_thu_thang)

        bieu_do_doanh_thu = {
            'nhan': nhan,
            'du_lieu': [{
                'data': du_lieu_doanh_thu,
                'color': 'rgba(134, 65, 244, 1)',
                'strokeWidth': 2
            }],
            'chu_thich': ['Doanh thu theo tháng']
        }

        # Top 5 sản phẩm
        top_san_pham = dong_HoaDon \
            .values('idsanpham__tensp') \
            .annotate(soluong=Sum('soluongsp')) \
            .order_by('-soluong')[:5]

        top_san_pham_data = [
            {
                'hang': i + 1,
                'ten': sp['idsanpham__tensp'],
                'so_luong': sp['soluong']
            } for i, sp in enumerate(top_san_pham)
        ]

        # Biểu đồ tròn theo loại sản phẩm
        theo_loai = dong_HoaDon.values('idsanpham__loaisp') \
            .annotate(soluong=Sum('soluongsp')) \
            .order_by('-soluong')

        mau_sac = ['rgba(131, 167, 234, 1)', 'rgba(255, 165, 180, 1)', 'rgba(131, 227, 234, 1)']
        bieu_do_tron = [
            {
                'ten': loai['idsanpham__loaisp'],
                'so_luong': loai['soluong'],
                'mau_sac': mau_sac[i % len(mau_sac)],
                'mau_chu_chu_thich': '#7F7F7F',
                'co_chu_chu_thich': 12
            } for i, loai in enumerate(theo_loai)
        ]

        # Thức uống & DoAn bán chạy
        thuc_uong_ban_chay = dong_HoaDon.filter(idsanpham__loaisp='DoUong') \
            .values('idsanpham__tensp') \
            .annotate(tong=Sum('soluongsp')) \
            .order_by('-tong').first()

        do_an_ban_chay = dong_HoaDon.filter(idsanpham__loaisp='DoAn') \
            .values('idsanpham__tensp') \
            .annotate(tong=Sum('soluongsp')) \
            .order_by('-tong').first()

        du_lieu = {
            'tong_hoa_don': tong_hoa_don,
            'tong_doanh_thu': tong_doanh_thu,
            'tong_san_pham_ban': tong_san_pham,
            'tong_thuc_uong_ban': tong_thuc_uong,
            'tong_do_an_ban': tong_do_an,
            'bieu_do_doanh_thu': bieu_do_doanh_thu,
            'top_san_pham': top_san_pham_data,
            'bieu_do_tron': bieu_do_tron,
            'thuc_uong_ban_chay': thuc_uong_ban_chay['idsanpham__tensp'] if thuc_uong_ban_chay else None,
            'do_an_ban_chay': do_an_ban_chay['idsanpham__tensp'] if do_an_ban_chay else None,
        }
        serializer = StatisticsSerializer(du_lieu)
        return Response(serializer.data)
