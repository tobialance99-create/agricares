import random
import redis
import os
import requests
import json

redis_client = redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))

OTP_EXPIRY = 300  # 5 minutes

def generate_otp():
    return str(random.randint(100000, 999999))

def store_otp(mobile_number, otp):
    redis_client.setex(f'otp:{mobile_number}', OTP_EXPIRY, otp)

def verify_otp(mobile_number, otp):
    stored = redis_client.get(f'otp:{mobile_number}')
    if stored and stored.decode() == otp:
        redis_client.delete(f'otp:{mobile_number}')
        return True
    return False

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
    redis_client.setex(f'pending_reg:{mobile_number}', OTP_EXPIRY, json.dumps(data))

def get_pending_registration(mobile_number):
    data = redis_client.get(f'pending_reg:{mobile_number}')
    return json.loads(data) if data else None

def clear_pending_registration(mobile_number):
    redis_client.delete(f'pending_reg:{mobile_number}')

def mark_otp_verified(mobile_number):
    redis_client.setex(f'otp_verified:{mobile_number}', OTP_EXPIRY, '1')

def is_otp_verified(mobile_number):
    return redis_client.get(f'otp_verified:{mobile_number}') is not None

def clear_otp_verified(mobile_number):
    redis_client.delete(f'otp_verified:{mobile_number}')

