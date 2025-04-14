from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from .auth.jwt_handler import JWTHandler

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        request = args[0]
        jwt_handler = JWTHandler()

        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Response({
                'error': 'Thiếu Authorization header'
            }, status=status.HTTP_401_UNAUTHORIZED)

        try:
            token_type, token = auth_header.split()
            if token_type.lower() != 'bearer':
                raise Exception('Invalid token type')

            payload = jwt_handler.verify_token(token)
            if payload['type'] != 'access':
                raise Exception('Invalid token type')

            request.user = payload
            return f(*args, **kwargs)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)

    return decorated