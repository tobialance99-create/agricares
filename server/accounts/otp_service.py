import random
import redis
import os
import requests

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

    response = requests.post('https://api.semaphore.co/api/v4/messages', data={
        'apikey': os.getenv('SEMAPHORE_API_KEY'),
        'number': mobile_number,
        'message': f'Your AgriCare OTP is: {otp}. Valid for 5 minutes.',
        'sendername': os.getenv('SEMAPHORE_SENDER_NAME', 'AgriCare'),
    })

    return response.status_code == 200
