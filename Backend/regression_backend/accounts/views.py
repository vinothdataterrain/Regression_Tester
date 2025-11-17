from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.response import Response
from rest_framework import viewsets,status
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.views import TokenRefreshView
from .models import Profile
from .serializers import ProfileSerializer
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"details" : "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Logout successful."}, status=status.HTTP_200_OK)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get the new access token
            access_token = response.data.get('access')
            if access_token:
                # Decode the token to get user info
                from rest_framework_simplejwt.tokens import AccessToken
                token = AccessToken(access_token)
                
                # Add custom claims to the response
                response.data['username'] = token.get('username')
                response.data['email'] = token.get('email')
                response.data['user_id'] = token.get('user_id')
        
        return response

def _get_token(data):
    token_serializer = CustomTokenObtainPairSerializer(data=data, partial=True)
    try:
        token_serializer.is_valid(raise_exception=True)
        refresh = token_serializer.validated_data['refresh']
        access_token = token_serializer.validated_data['access']
        return Response({
            "refresh": str(refresh),
            "access": str(access_token),
        }, status=status.HTTP_200_OK)
    except AuthenticationFailed as e:
        return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = Profile.objects.get(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

