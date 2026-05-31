from core.firebase import db
from datetime import datetime, timezone, timedelta

TICKETS_COLLECTION = 'tickets'
ANALYTICS_COLLECTION = 'analytics'

def get_ticket_counts():
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)

    tickets = db.collection(TICKETS_COLLECTION).get()
    
    today_count = 0
    weekly_count = 0
    monthly_count = 0

    for ticket in tickets:
        data = ticket.to_dict()
        ticket_date = data.get('date')
        if not ticket_date:
            continue
        if isinstance(ticket_date, str):
            ticket_date = datetime.fromisoformat(ticket_date).replace(tzinfo=timezone.utc)
        if ticket_date >= today_start:
            today_count += 1
        if ticket_date >= week_start:
            weekly_count += 1
        if ticket_date >= month_start:
            monthly_count += 1

    return {
        'today': today_count,
        'weekly': weekly_count,
        'monthly': monthly_count,
    }

def get_knowledge_repository_visits():
    doc = db.collection(ANALYTICS_COLLECTION).document('knowledge_repository').get()
    if doc.exists:
        return doc.to_dict().get('visits', 0)
    return 0

def increment_knowledge_repository_visits():
    ref = db.collection(ANALYTICS_COLLECTION).document('knowledge_repository')
    doc = ref.get()
    if doc.exists:
        ref.update({'visits': doc.to_dict().get('visits', 0) + 1})
    else:
        ref.set({'visits': 1})
