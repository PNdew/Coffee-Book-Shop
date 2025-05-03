from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models.user import TaiKhoan, NhanVien
from ..models.rolls import ChucVu
import hashlib

class LoginView(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        password = request.data.get('password')
        
        try:
            # Tìm tài khoản
            account = TaiKhoan.objects.get(SDTNV=phone)
            
            # Kiểm tra mật khẩu (giả sử đã hash)
            if account.check_password(password):
                # Lấy thông tin nhân viên
                employee = NhanVien.objects.get(SDTNV=phone)
                
                # Xác định quyền hạn dựa trên chức vụ
                is_admin = employee.ChucVuNV == "1"
                
                # Trả về thông tin đăng nhập và quyền hạn
                return Response({
                    'success': True,
                    'user': {
                        'id': employee.IDNhanVien,
                        'name': employee.TenNV,
                        'phone': employee.SDTNV,
                        'email': employee.EmailNV,
                        'role': "Quản lý" if is_admin else "Nhân viên",
                        'permissions': {
                            'canView': True,  # Ai cũng có quyền xem
                            'canAdd': is_admin,
                            'canEdit': is_admin,
                            'canDelete': is_admin,
                        }
                    }
                })
            else:
                return Response({'success': False, 'message': 'Sai mật khẩu'}, status=status.HTTP_401_UNAUTHORIZED)
                
        except TaiKhoan.DoesNotExist:
            return Response({'success': False, 'message': 'Tài khoản không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
