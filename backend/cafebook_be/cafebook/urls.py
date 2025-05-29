from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.authentication import login_view  # Import hàm xử lý login
from .views.createOrder import createOrder, createOrderDetails
from .views.getProduct import (SanphamViewSet, DonghoadonViewSet, HoadonViewSet)  # Import các viewset cho sản phẩm, voucher và hóa đơn
from .views.ingredient import NguyenLieuViewSet  # Import viewset cho nguyên liệu
from .views.book import SachViewSet, TheLoaiViewSet  # Import viewset cho sách
from .views.attendance import check_attendance  # Import hàm chấm công
from .views.voucher import VoucherViewSet
from .views.staff import NhanVienViewSet, ChucVuViewSet  # Import viewset cho nhân viên và chức vụ
from .views.checkpermission import check_permission_api
from .views.authentication import login_view
from .views.staff import NhanVienViewSet, ChucVuViewSet
from .views.statitics import StatisticsView
from .views.forgotpassword import forgot_password, verify_otp, reset_password
from .views.change_password import change_password

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
    path("checkpermission/", check_permission_api),
    path("attendance/check/", check_attendance, name="check_attendance"),
    path("order/create/", createOrder, name="create_order"),
    path("order/details/", createOrderDetails, name="create_order_line"),
    path("statistics/", StatisticsView.as_view(), name="statistics"),
    path("change-password/", change_password, name="change_password"),
    path("forgot-password/", forgot_password, name="forgot_password"),
    path("verify-otp/", verify_otp, name="verify_otp"),
    path("reset-password/", reset_password, name="reset-password"),
    path("", include(router.urls)),
]

