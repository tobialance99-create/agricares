from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from .serializers import RegisterSerializer, LoginSerializer, SendOTPSerializer, VerifyOTPSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
from .firebase_service import get_user_by_username, get_user_by_mobile, get_user_by_identifier, create_user, update_user
from .otp_service import send_otp, verify_otp

def get_tokens(user_id, role):
    refresh = RefreshToken()
    refresh['user_id'] = user_id
    refresh['role'] = role
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        if get_user_by_username(data['username']):
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        if get_user_by_mobile(data['mobileNumber']):
            return Response({'error': 'Mobile number already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user_data = {
            **data,
            'passwordHash': make_password(data['password']),
            'isPending': data['role'] == 'extension_worker',
        }
        user_data.pop('password')

        create_user(user_data)
        return Response({'message': 'Registration successful'}, status=status.HTTP_201_CREATED)


class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        mobile_number = serializer.validated_data['mobileNumber']
        success = send_otp(mobile_number)

        if not success:
            return Response({'error': 'Failed to send OTP'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'OTP sent successfully'})


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        mobile_number = serializer.validated_data['mobileNumber']
        otp = serializer.validated_data['otp']

        if not verify_otp(mobile_number, otp):
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'OTP verified successfully'})


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data['identifier']
        password = serializer.validated_data['password']

        user = get_user_by_identifier(identifier)

        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.get('isActive'):
            return Response({'error': 'Account is disabled'}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, user['passwordHash']):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.get('isPending'):
            return Response({'error': 'Account is pending approval', 'isPending': True}, status=status.HTTP_403_FORBIDDEN)

        tokens = get_tokens(user['id'], user['role'])

        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': {
                'id': user['id'],
                'firstName': user['firstName'],
                'lastName': user['lastName'],
                'role': user['role'],
                'mobileNumber': user['mobileNumber'],
            }
        })


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data['identifier']
        user = get_user_by_identifier(identifier)

        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        success = send_otp(user['mobileNumber'])

        if not success:
            return Response({'error': 'Failed to send OTP'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'OTP sent successfully', 'mobileNumber': user['mobileNumber']})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data['identifier']
        otp = serializer.validated_data['otp']
        password = serializer.validated_data['password']

        user = get_user_by_identifier(identifier)

        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if not verify_otp(user['mobileNumber'], otp):
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)

        update_user(user['id'], {
            'passwordHash': make_password(password),
            'isResetPass': False,
        })

        return Response({'message': 'Password reset successfully'})
