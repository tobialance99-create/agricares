from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.firebase_service import get_user_by_identifier
from core.firebase import db
from tickets.firebase_service import get_ticket_counts, get_knowledge_repository_visits

USERS_COLLECTION = 'users'

def get_worker_counts():
    docs = db.collection(USERS_COLLECTION).where('role', '==', 'extension_worker').get()
    active = 0
    inactive = 0
    for doc in docs:
        data = doc.to_dict()
        if data.get('isActive'):
            active += 1
        else:
            inactive += 1
    return {'active': active, 'inactive': inactive}

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        workers = get_worker_counts()
        tickets = get_ticket_counts()
        visits = get_knowledge_repository_visits()

        return Response({
            'workers': {
                'active': workers['active'],
                'inactive': workers['inactive'],
            },
            'tickets': {
                'today': tickets['today'],
                'weekly': tickets['weekly'],
                'monthly': tickets['monthly'],
            },
            'knowledgeRepositoryVisits': visits,
        })
