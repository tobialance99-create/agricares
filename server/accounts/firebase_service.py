from core.firebase import db
from datetime import datetime

USERS_COLLECTION = 'users'
ROLES_COLLECTION = 'roles'

def get_user_by_username(username):
    docs = db.collection(USERS_COLLECTION).where('username', '==', username).limit(1).get()
    for doc in docs:
        return {'id': doc.id, **doc.to_dict()}
    return None

def get_user_by_mobile(mobile_number):
    docs = db.collection(USERS_COLLECTION).where('mobileNumber', '==', mobile_number).limit(1).get()
    for doc in docs:
        return {'id': doc.id, **doc.to_dict()}
    return None

def get_user_by_id(user_id):
    doc = db.collection(USERS_COLLECTION).document(user_id).get()
    if doc.exists:
        return {'id': doc.id, **doc.to_dict()}
    return None

def create_user(data):
    doc_ref = db.collection(USERS_COLLECTION).document()
    doc_ref.set({
        'firstName': data['firstName'],
        'lastName': data['lastName'],
        'barangay': data.get('barangay', ''),
        'username': data['username'],
        'mobileNumber': data['mobileNumber'],
        'passwordHash': data['passwordHash'],
        'role': data['role'],
        'isActive': True,
        'isResetPass': False,
        'isPending': data.get('isPending', False),
        'date': datetime.utcnow().isoformat(),
    })
    return doc_ref.id

def update_user(user_id, data):
    db.collection(USERS_COLLECTION).document(user_id).update(data)

def get_user_by_identifier(identifier):
    user = get_user_by_username(identifier)
    if not user:
        user = get_user_by_mobile(identifier)
    return user
