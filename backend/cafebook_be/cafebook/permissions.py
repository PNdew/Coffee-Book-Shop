from rest_framework.permissions import BasePermission
from .auth.jwt_handler import JWTHandler

class IsAuthenticatedWithJWT(BasePermission):
    def has_permission(self, request, view):
        auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return False
        try:
            token_type, token = auth_header.split()
            if token_type.lower() != 'bearer':
                return False
            jwt_handler = JWTHandler()
            payload = jwt_handler.verify_token(token)
            return payload.get('type') == 'access'
        except:
            return False
