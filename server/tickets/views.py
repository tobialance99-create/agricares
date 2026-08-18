from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from datetime import datetime, timezone, timedelta
from .firebase_service import (
    extract_keywords, find_matching_ticket, create_ticket, join_ticket,
    get_all_tickets, get_all_tickets_filtered, get_available_ticket_years,
    get_tickets_by_worker, get_ticket_by_id, get_ticket_messages,
    get_knowledge_repository_visits, increment_knowledge_repository_visits,
    update_ticket_status, add_message, pin_message, delete_ticket, delete_message
)

class CheckTicketView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        concern = request.data.get('concern', '')
        extension_worker_id = request.data.get('extensionWorkerId', '')
        if not concern or not extension_worker_id:
            return Response({'error': 'concern and extensionWorkerId are required'}, status=status.HTTP_400_BAD_REQUEST)
        keywords = extract_keywords(concern)
        match = find_matching_ticket(extension_worker_id, keywords)
        if match:
            return Response({'exists': True, 'ticket': match})
        return Response({'exists': False})

class SubmitTicketView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        concern = request.data.get('concern', '')
        extension_worker_id = request.data.get('extensionWorkerId', '')
        extension_worker_name = request.data.get('extensionWorkerName', '')
        farmer_name = request.data.get('farmerName', '')
        join_existing = request.data.get('joinExisting', False)
        ticket_id = request.data.get('ticketId', None)
        file_data = request.data.get('fileData', '')
        file_name = request.data.get('fileName', '')
        file_type = request.data.get('fileType', '')

        if file_data and len(file_data.encode('utf-8')) > 1048487:
            return Response({'error': 'File size must be 1MB or less.'}, status=status.HTTP_400_BAD_REQUEST)

        if not concern or not extension_worker_id:
            return Response({'error': 'concern and extensionWorkerId are required'}, status=status.HTTP_400_BAD_REQUEST)

        keywords = extract_keywords(concern)

        if join_existing and ticket_id:
            join_ticket(ticket_id, request.user.id, farmer_name, concern)
            from accounts.firebase_service import broadcast_ticket_update, create_notification, notify_user_ws
            broadcast_ticket_update()
            ticket = get_ticket_by_id(ticket_id)
            if ticket:
                worker_id = ticket.get('extensionWorkerId')
                if worker_id:
                    create_notification(worker_id, 'ticket_reply', f'{farmer_name} joined your ticket.', request.user.id, ticket_id)
                    notify_user_ws(worker_id, {'type': 'ticket_reply', 'message': f'{farmer_name} joined your ticket.'})
            return Response({'message': 'Joined existing ticket', 'ticketId': ticket_id})

        ticket_id = create_ticket({
            'extensionWorkerId': extension_worker_id,
            'extensionWorkerName': extension_worker_name,
            'concern': concern,
            'keywords': keywords,
            'farmerId': request.user.id,
            'farmerName': farmer_name,
            'fileData': file_data,
            'fileName': file_name,
            'fileType': file_type,
        })
        from accounts.firebase_service import broadcast_ticket_update, create_notification, notify_user_ws
        broadcast_ticket_update()
        create_notification(extension_worker_id, 'ticket_reply', f'{farmer_name} submitted a ticket to you.', request.user.id, ticket_id)
        notify_user_ws(extension_worker_id, {'type': 'ticket_reply', 'message': f'{farmer_name} submitted a ticket to you.'})
        return Response({'message': 'Ticket created', 'ticketId': ticket_id}, status=status.HTTP_201_CREATED)

class TicketListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'extension_worker':
            tickets = get_tickets_by_worker(request.user.id)
            return Response(tickets)
        if request.user.role == 'farmer':
            tickets = get_all_tickets()
            return Response(tickets)
        from datetime import date
        now = datetime.now(timezone.utc)
        week_start_str = request.query_params.get('week_start')
        if week_start_str:
            try:
                week_start_date = date.fromisoformat(week_start_str)
            except ValueError:
                current_monday = now - timedelta(days=now.weekday())
                week_start_date = current_monday.date()
        else:
            current_monday = now - timedelta(days=now.weekday())
            week_start_date = current_monday.date()
        tickets, week_start, week_end, month, year = get_all_tickets_filtered(week_start_date)
        available_years = get_available_ticket_years()
        return Response({
            'tickets': tickets,
            'weekLabel': f'{week_start} – {week_end}',
            'month': month,
            'year': year,
            'availableYears': available_years,
        })

class TicketDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ticket_id):
        ticket = get_ticket_by_id(ticket_id)
        if not ticket:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)
        messages = get_ticket_messages(ticket_id)
        return Response({**ticket, 'messages': messages})

class KnowledgeRepositoryVisitsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'visits': get_knowledge_repository_visits()})

    def post(self, request):
        increment_knowledge_repository_visits()
        return Response({'message': 'Visit recorded'})

class TicketStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, ticket_id):
        new_status = request.data.get('status')
        if new_status not in ['pending', 'ongoing', 'resolved']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        ticket = get_ticket_by_id(ticket_id)
        if not ticket:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)
        update_ticket_status(ticket_id, new_status)
        from accounts.firebase_service import broadcast_ticket_update, create_notification, notify_user_ws
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        broadcast_ticket_update()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(f'ticket_{ticket_id}', {
            'type': 'ticket_message',
            'data': {'type': 'new_message'},
        })
        if new_status == 'resolved':
            for participant_id in ticket.get('participants', []):
                create_notification(participant_id, 'ticket_resolved', 'Your ticket has been marked as resolved.', request.user.id, ticket_id)
                notify_user_ws(participant_id, {'type': 'ticket_resolved', 'message': 'Your ticket has been marked as resolved.'})
        if new_status == 'ongoing':
            for participant_id in ticket.get('participants', []):
                create_notification(participant_id, 'ticket_reply', 'Your ticket is now being handled.', request.user.id, ticket_id)
                notify_user_ws(participant_id, {'type': 'ticket_reply', 'message': 'Your ticket is now being handled.'})
        return Response({'message': 'Status updated'})

class TicketMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, ticket_id):
        message = request.data.get('message', '').strip()
        file_data = request.data.get('fileData', '')
        file_name = request.data.get('fileName', '')
        file_type = request.data.get('fileType', '')
        if not message and not file_data:
            return Response({'error': 'message or file is required'}, status=status.HTTP_400_BAD_REQUEST)
        if file_data and len(file_data.encode('utf-8')) > 1048487:
            return Response({'error': 'File size must be 1MB or less.'}, status=status.HTTP_400_BAD_REQUEST)
        ticket = get_ticket_by_id(ticket_id)
        if not ticket:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)
        from accounts.firebase_service import get_user_by_id, create_notification, notify_user_ws
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        user_data = get_user_by_id(request.user.id)
        sender_name = f"{user_data['firstName']} {user_data['lastName']}" if user_data else 'Unknown'
        add_message(ticket_id, {
            'senderId': request.user.id,
            'senderName': sender_name,
            'senderRole': request.user.role,
            'message': message,
            'fileData': file_data,
            'fileName': file_name,
            'fileType': file_type,
        })
        if request.user.role == 'extension_worker' and ticket.get('status') == 'pending':
            update_ticket_status(ticket_id, 'ongoing')
        if request.user.role == 'farmer' and ticket.get('status') == 'resolved':
            update_ticket_status(ticket_id, 'pending')
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(f'ticket_{ticket_id}', {
            'type': 'ticket_message',
            'data': {'type': 'new_message'},
        })
        if request.user.role == 'extension_worker':
            notif_message = f'{sender_name} replied: {message}' if message else f'{sender_name} replied and sent an attachment.'
            notif = {'type': 'ticket_reply', 'message': notif_message}
            for participant_id in ticket.get('participants', []):
                create_notification(participant_id, 'ticket_reply', notif_message, request.user.id, ticket_id)
                notify_user_ws(participant_id, notif)
        elif request.user.role == 'farmer':
            worker_id = ticket.get('extensionWorkerId')
            if worker_id:
                notif_message = f'{sender_name} replied: {message}' if message else f'{sender_name} replied and sent an attachment.'
                notif = {'type': 'ticket_reply', 'message': notif_message}
                create_notification(worker_id, 'ticket_reply', notif_message, request.user.id, ticket_id)
                notify_user_ws(worker_id, notif)
        return Response({'message': 'Message sent'}, status=status.HTTP_201_CREATED)

class TicketMessageDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, ticket_id, message_id):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can delete messages'}, status=status.HTTP_403_FORBIDDEN)
        ticket = get_ticket_by_id(ticket_id)
        if not ticket:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)
        delete_message(ticket_id, message_id)
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(f'ticket_{ticket_id}', {
            'type': 'ticket_message',
            'data': {'type': 'new_message'},
        })
        return Response({'message': 'Message deleted'})

class TicketDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, ticket_id):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can delete tickets'}, status=status.HTTP_403_FORBIDDEN)
        ticket = get_ticket_by_id(ticket_id)
        if not ticket:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)
        delete_ticket(ticket_id)
        from accounts.firebase_service import broadcast_ticket_update
        broadcast_ticket_update()
        return Response({'message': 'Ticket deleted'})

class TicketPinView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, ticket_id, message_id):
        ticket = get_ticket_by_id(ticket_id)
        if not ticket:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)
        if request.user.role != 'extension_worker':
            return Response({'error': 'Only extension workers can pin messages'}, status=status.HTTP_403_FORBIDDEN)
        pin_message(ticket_id, message_id)
        from accounts.firebase_service import get_user_by_id, create_notification, notify_user_ws
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(f'ticket_{ticket_id}', {
            'type': 'ticket_message',
            'data': {'type': 'pin_updated'},
        })
        user_data = get_user_by_id(request.user.id)
        sender_name = f"{user_data['firstName']} {user_data['lastName']}" if user_data else 'Unknown'
        notif = {'type': 'ticket_pinned', 'message': f'{sender_name} pinned an answer on your ticket.'}
        for participant_id in ticket.get('participants', []):
            create_notification(participant_id, 'ticket_pinned', notif['message'], request.user.id, ticket_id)
            notify_user_ws(participant_id, notif)
        return Response({'message': 'Message pinned'})
