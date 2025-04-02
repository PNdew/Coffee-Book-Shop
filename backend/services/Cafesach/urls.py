from django.urls import path
from .views import login_view  # Import hàm xử lý login

urlpatterns = [
    path("login/", login_view, name="login"),  # API login
]
