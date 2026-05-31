from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .firebase_service import (
    get_all_farmers, get_all_extension_workers, get_user_by_id,
    delete_user, toggle_user_active, approve_extension_worker, update_user
)

class FarmerListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        farmers = get_all_farmers()
        return Response(farmers)

class FarmerDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_user_by_id(user_id)
        if not user:
            return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(user)

    def delete(self, request, user_id):
        user = get_user_by_id(user_id)
        if not user:
            return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)
        delete_user(user_id)
        return Response({'message': 'Farmer deleted successfully'})

class FarmerToggleActiveView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        user = get_user_by_id(user_id)
        if not user:
            return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)
        toggle_user_active(user_id)
        return Response({'message': 'Farmer status updated'})

class ExtensionWorkerListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        workers = get_all_extension_workers()
        return Response(workers)

class ExtensionWorkerDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_user_by_id(user_id)
        if not user:
            return Response({'error': 'Extension worker not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(user)

    def delete(self, request, user_id):
        user = get_user_by_id(user_id)
        if not user:
            return Response({'error': 'Extension worker not found'}, status=status.HTTP_404_NOT_FOUND)
        delete_user(user_id)
        return Response({'message': 'Extension worker deleted successfully'})

class ExtensionWorkerToggleActiveView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        user = get_user_by_id(user_id)
        if not user:
            return Response({'error': 'Extension worker not found'}, status=status.HTTP_404_NOT_FOUND)
        toggle_user_active(user_id)
        return Response({'message': 'Extension worker status updated'})

class ExtensionWorkerApproveView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        user = get_user_by_id(user_id)
        if not user:
            return Response({'error': 'Extension worker not found'}, status=status.HTTP_404_NOT_FOUND)
        approve_extension_worker(user_id)
        return Response({'message': 'Extension worker approved'})

class ExtensionWorkerChangePositionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        position_id = request.data.get('positionId')
        if not position_id:
            return Response({'error': 'Position ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        user = get_user_by_id(user_id)
        if not user:
            return Response({'error': 'Extension worker not found'}, status=status.HTTP_404_NOT_FOUND)
        update_user(user_id, {'positionId': position_id})
        return Response({'message': 'Position updated'})
