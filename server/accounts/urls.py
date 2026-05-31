from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, SendOTPView, VerifyOTPView, LoginView, ForgotPasswordView, ResetPasswordView, CheckUsernameView, CheckMobileView, CompleteRegistrationView, CheckPendingView, CheckEmailView
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('login/', LoginView.as_view(), name='login'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('check-username/', CheckUsernameView.as_view(), name='check-username'),
    path('check-mobile/', CheckMobileView.as_view(), name='check-mobile'),
    path('complete-registration/', CompleteRegistrationView.as_view(), name='complete-registration'),
    path('check-pending/', CheckPendingView.as_view(), name='check-pending'),
    path('check-email/', CheckEmailView.as_view(), name='check-email'),
]
