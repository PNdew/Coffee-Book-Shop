from rest_framework.permissions import BasePermission

class IsAuthenticatedWithJWT(BasePermission):
    def has_permission(self, request, view):
        from .auth.get_user_token import get_user_from_token
        user, error = get_user_from_token(request)
        return user is not None and not error
