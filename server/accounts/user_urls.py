from django.urls import path
from .user_views import (
    FarmerListView, FarmerDetailView, FarmerToggleActiveView,
    ExtensionWorkerListView, ExtensionWorkerDetailView,
    ExtensionWorkerToggleActiveView, ExtensionWorkerApproveView,
    ExtensionWorkerChangePositionView
)

urlpatterns = [
    path('farmers/', FarmerListView.as_view(), name='farmer-list'),
    path('farmers/<str:user_id>/', FarmerDetailView.as_view(), name='farmer-detail'),
    path('farmers/<str:user_id>/toggle-active/', FarmerToggleActiveView.as_view(), name='farmer-toggle-active'),
    path('extension-workers/', ExtensionWorkerListView.as_view(), name='extension-worker-list'),
    path('extension-workers/<str:user_id>/', ExtensionWorkerDetailView.as_view(), name='extension-worker-detail'),
    path('extension-workers/<str:user_id>/toggle-active/', ExtensionWorkerToggleActiveView.as_view(), name='extension-worker-toggle-active'),
    path('extension-workers/<str:user_id>/approve/', ExtensionWorkerApproveView.as_view(), name='extension-worker-approve'),
    path('extension-workers/<str:user_id>/change-position/', ExtensionWorkerChangePositionView.as_view(), name='extension-worker-change-position'),
]
