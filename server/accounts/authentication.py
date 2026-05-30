from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .firebase_service import get_user_by_id

class FirebaseUser:
    def __init__(self, user_data):
        self.id = user_data['id']
        self.role = user_data.get('role')
        self.is_authenticated = True
        self.is_active = user_data.get('isActive', True)

class FirebaseJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except Exception:
            return None

    def get_user(self, validated_token):
        user_id = validated_token.get('user_id')
        if not user_id:
            return None
        user_data = get_user_by_id(user_id)
        if not user_data:
            return None
        return FirebaseUser(user_data)

