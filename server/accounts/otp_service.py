import random
import redis
import os
import requests
import json
from datetime import datetime, timezone, timedelta
from core.firebase import db

redis_client = redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))

OTP_EXPIRY = 300  # 5 minutes
OTP_COLLECTION = 'otps'
PENDING_REG_COLLECTION = 'pending_registrations'

def generate_otp():
    return str(random.randint(100000, 999999))

def _redis_available():
    try:
        redis_client.ping()
        return True
    except Exception:
        return False

def store_otp(mobile_number, otp):
    if _redis_available():
        redis_client.setex(f'otp:{mobile_number}', OTP_EXPIRY, otp)
    else:
        db.collection(OTP_COLLECTION).document(mobile_number).set({
            'otp': otp,
            'expiresAt': datetime.now(timezone.utc) + timedelta(seconds=OTP_EXPIRY)
        })

def verify_otp(mobile_number, otp):
    if _redis_available():
        stored = redis_client.get(f'otp:{mobile_number}')
        if stored and stored.decode() == otp:
            redis_client.delete(f'otp:{mobile_number}')
            return True
        return False
    else:
        doc = db.collection(OTP_COLLECTION).document(mobile_number).get()
        if not doc.exists:
            return False
        data = doc.to_dict()
        if data['otp'] != otp:
            return False
        if datetime.now(timezone.utc) > data['expiresAt']:
            db.collection(OTP_COLLECTION).document(mobile_number).delete()
            return False
        db.collection(OTP_COLLECTION).document(mobile_number).delete()
        return True


def send_otp(mobile_number):
    otp = generate_otp()
    store_otp(mobile_number, otp)

    if os.getenv('DEBUG', 'True') == 'True':
        print(f'[DEV] OTP for {mobile_number}: {otp}')
        return True

    response = requests.post('https://api.semaphore.co/api/v4/messages', data={
        'apikey': os.getenv('SEMAPHORE_API_KEY'),
        'number': mobile_number,
        'message': f'Your AgriCare OTP is: {otp}. Valid for 5 minutes.',
        'sendername': os.getenv('SEMAPHORE_SENDER_NAME', 'AgriCare'),
    })

    if response.status_code != 200:
        raise Exception(f'Semaphore error: {response.status_code} - {response.text}')
    return True

def store_pending_registration(mobile_number, data):
    if _redis_available():
        redis_client.setex(f'pending_reg:{mobile_number}', OTP_EXPIRY, json.dumps(data))
    else:
        db.collection(PENDING_REG_COLLECTION).document(mobile_number).set({
            'data': json.dumps(data),
            'expiresAt': datetime.now(timezone.utc) + timedelta(seconds=OTP_EXPIRY)
        })

def get_pending_registration(mobile_number):
    if _redis_available():
        data = redis_client.get(f'pending_reg:{mobile_number}')
        return json.loads(data) if data else None
    else:
        doc = db.collection(PENDING_REG_COLLECTION).document(mobile_number).get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        if datetime.now(timezone.utc) > data['expiresAt']:
            db.collection(PENDING_REG_COLLECTION).document(mobile_number).delete()
            return None
        return json.loads(data['data'])

def clear_pending_registration(mobile_number):
    if _redis_available():
        redis_client.delete(f'pending_reg:{mobile_number}')
    else:
        db.collection(PENDING_REG_COLLECTION).document(mobile_number).delete()

def mark_otp_verified(mobile_number):
    if _redis_available():
        redis_client.setex(f'otp_verified:{mobile_number}', OTP_EXPIRY, '1')
    else:
        db.collection(OTP_COLLECTION).document(f'verified_{mobile_number}').set({
            'verified': True,
            'expiresAt': datetime.now(timezone.utc) + timedelta(seconds=OTP_EXPIRY)
        })

def is_otp_verified(mobile_number):
    if _redis_available():
        return redis_client.get(f'otp_verified:{mobile_number}') is not None
    else:
        doc = db.collection(OTP_COLLECTION).document(f'verified_{mobile_number}').get()
        if not doc.exists:
            return False
        data = doc.to_dict()
        if datetime.now(timezone.utc) > data['expiresAt']:
            db.collection(OTP_COLLECTION).document(f'verified_{mobile_number}').delete()
            return False
        return True

def clear_otp_verified(mobile_number):
    if _redis_available():
        redis_client.delete(f'otp_verified:{mobile_number}')
    else:
        db.collection(OTP_COLLECTION).document(f'verified_{mobile_number}').delete()


