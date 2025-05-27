import jwt
from django.conf import settings
from django.db import connection

def get_user_from_token(request):
    try:
        # Lấy token từ header Authorization
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header:
            return None, "Không có token trong header"
            
        # Kiểm tra format "Bearer <token>"
        if not auth_header.startswith('Bearer '):
            return None, "Token không đúng format Bearer"
            
        token = auth_header.split(' ')[1]
        
        # Giải mã token với SECRET_KEY từ settings
        try:
            # Sử dụng JWT_ALGORITHM từ settings, mặc định là HS256
            algorithm = getattr(settings, 'JWT_ALGORITHM', 'HS256')
            decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[algorithm])
            
            # Lấy thông tin user từ database
            sdtnv = decoded.get('SDTNV')
            if not sdtnv:
                return None, "Token không chứa SDTNV"
                
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT n.SDTNV, n.TenNV, n.IDChucVu 
                    FROM nhanvien n 
                    WHERE n.SDTNV = %s
                """, [sdtnv])
                
                user_data = cursor.fetchone()
                if not user_data:
                    return None, "Không tìm thấy nhân viên"
                
                user_info = {
                    'SDTNV': user_data[0],
                    'TenNV': user_data[1], 
                    'ChucVuNV': user_data[2]
                }
                return user_info, None
                
        except jwt.ExpiredSignatureError:
            return None, "Token đã hết hạn"
        except jwt.InvalidTokenError as e:
            return None, f"Token không hợp lệ: {str(e)}"
            
    except Exception as e:
        return None, f"Lỗi xử lý token: {str(e)}"
