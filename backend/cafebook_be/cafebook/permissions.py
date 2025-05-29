from rest_framework.permissions import BasePermission

class IsAuthenticatedWithJWT(BasePermission):
    def __init__(self):
        print("Initializing IsAuthenticatedWithJWT permission class...")
        super().__init__()
    def has_permission(self, request, view):
        print("Checking JWT authentication...")
        from .auth.get_user_token import get_user_from_token
        user, error = get_user_from_token(request)
        print("User:", user, "Error:", error)
        request.user = user
        return user is not None and not error
