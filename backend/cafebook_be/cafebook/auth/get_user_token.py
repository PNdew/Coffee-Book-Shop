import jwt
from django.conf import settings
from jwt.exceptions import ExpiredSignatureError, DecodeError

def get_user_from_token(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None, 'Không tìm thấy token trong header'

    try:
        token_type, token = auth_header.split()
        if token_type.lower() != 'bearer':
            return None, 'Loại token không hợp lệ'

        # Giải mã token
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return decoded, None

    except ValueError:
        return None, 'Header Authorization sai định dạng'
    except ExpiredSignatureError:
        return None, 'Token đã hết hạn'
    except DecodeError:
        return None, 'Không thể giải mã token'
