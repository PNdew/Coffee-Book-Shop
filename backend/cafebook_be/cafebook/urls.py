from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.authentication import login_view
from .views.createOrder import createOrder, createOrderDetails
from .views.getProduct import (SanphamViewSet, VoucherViewSet, DonghoadonViewSet, HoadonViewSet)
from .views.ingredient import NguyenLieuViewSet
from .views.book import SachViewSet, TheLoaiViewSet
from .views.attendance import check_attendance
from .views.staff import NhanVienViewSet, ChucVuViewSet
from .views.staff_register import register_staff  # Thêm import này
from .views.change_password import change_password  # Thêm dòng này vào phần import

# Tạo router cho các ViewSet
router = DefaultRouter()
router.register(r'sanpham', SanphamViewSet)
router.register(r'voucher', VoucherViewSet)
router.register(r'donghoadon', DonghoadonViewSet)
router.register(r'hoadon', HoadonViewSet)
router.register(r'nguyenlieu', NguyenLieuViewSet)
router.register(r'sach', SachViewSet)
router.register(r'theloai', TheLoaiViewSet)
router.register(r'nhanvien', NhanVienViewSet)
router.register(r'chucvu', ChucVuViewSet)

urlpatterns = [
    path("login/", login_view),
    path("attendance/check/", check_attendance, name="check_attendance"),
    path("order/create/", createOrder, name="create_order"),
    path("order/details/", createOrderDetails, name="create_order_line"),
    path("staff/register/", register_staff, name="register_staff"),
    path("change-password/", change_password, name="change_password"),
    path("", include(router.urls)),
]

