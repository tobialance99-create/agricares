from django.urls import path
from .consumers import SystemConsumer

websocket_urlpatterns = [
    path('ws/system/', SystemConsumer.as_asgi()),
]
