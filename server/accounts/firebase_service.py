from core.firebase import db
from datetime import datetime

USERS_COLLECTION = 'users'
ROLES_COLLECTION = 'roles'
POSITIONS_COLLECTION = 'positions'

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

def get_user_by_email(email):
    docs = db.collection(USERS_COLLECTION).where('email', '==', email).limit(1).get()
    for doc in docs:
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
        'email': data.get('email', ''),
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
    if not user:
        user = get_user_by_email(identifier)
    return user

def get_all_positions():
    docs = db.collection(POSITIONS_COLLECTION).get()
    return [{'id': doc.id, **doc.to_dict()} for doc in docs]

def get_position_by_id(position_id):
    doc = db.collection(POSITIONS_COLLECTION).document(position_id).get()
    if doc.exists:
        return {'id': doc.id, **doc.to_dict()}
    return None

def create_position(data):
    doc_ref = db.collection(POSITIONS_COLLECTION).document()
    doc_ref.set({
        'name': data['name'],
        'isActive': True,
    })
    return doc_ref.id

def update_position(position_id, data):
    db.collection(POSITIONS_COLLECTION).document(position_id).update(data)

def delete_position(position_id):
    db.collection(POSITIONS_COLLECTION).document(position_id).delete()

def get_all_farmers():
    docs = db.collection(USERS_COLLECTION).where('role', '==', 'farmer').get()
    return [{'id': doc.id, **doc.to_dict()} for doc in docs]

def get_all_extension_workers():
    docs = db.collection(USERS_COLLECTION).where('role', '==', 'extension_worker').get()
    return [{'id': doc.id, **doc.to_dict()} for doc in docs]

def delete_user(user_id):
    db.collection(USERS_COLLECTION).document(user_id).delete()

def toggle_user_active(user_id):
    user = get_user_by_id(user_id)
    if user:
        db.collection(USERS_COLLECTION).document(user_id).update({'isActive': not user.get('isActive', True)})

def approve_extension_worker(user_id):
    db.collection(USERS_COLLECTION).document(user_id).update({'isPending': False})
