from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.authentication import login_view  # Import hàm xử lý login
from .views.createOrder import createOrder, createOrderDetails
from .views.getProduct import (SanphamViewSet, VoucherViewSet, DonghoadonViewSet, HoadonViewSet)  # Import các viewset cho sản phẩm, voucher và hóa đơn
from .views.ingredient import NguyenLieuViewSet  # Import viewset cho nguyên liệu
from .views.book import SachViewSet  # Import viewset cho sách
from .views.attendance import check_attendance  # Import hàm chấm công

router = DefaultRouter()
router.register(r'sanpham', SanphamViewSet)
router.register(r'voucher', VoucherViewSet)
router.register(r'donghoadon', DonghoadonViewSet)
router.register(r'hoadon', HoadonViewSet)
router.register(r'nguyenlieu', NguyenLieuViewSet)  
router.register(r'sach', SachViewSet)

urlpatterns = [
    path("login/", login_view),
    path("attendance/check/", check_attendance, name="check_attendance"),
    path("order/create/", createOrder, name="create_order"),
    path("order/details/", createOrderDetails, name="create_order_line"),
    path("", include(router.urls)),
]

