from rest_framework import serializers

class RegisterSerializer(serializers.Serializer):
    firstName = serializers.CharField()
    lastName = serializers.CharField()
    barangay = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField()
    mobileNumber = serializers.CharField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=['farmer', 'extension_worker'])

class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

class SendOTPSerializer(serializers.Serializer):
    mobileNumber = serializers.CharField()

class VerifyOTPSerializer(serializers.Serializer):
    mobileNumber = serializers.CharField()
    otp = serializers.CharField()
    isRegistration = serializers.BooleanField(required=False, default=False)

class ForgotPasswordSerializer(serializers.Serializer):
    identifier = serializers.CharField()

class ResetPasswordSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

