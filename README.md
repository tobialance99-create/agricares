# 🌾 AgriCare

![Under Development](https://img.shields.io/badge/Status-Under%20Development-yellow)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![Django](https://img.shields.io/badge/Django-5.2.2-green)
![React](https://img.shields.io/badge/React-19-61dafb)

> A smart ticketing and support system designed to connect farmers with extension workers, providing faster solutions to agricultural concerns.

---

## 🚧 This project is currently under active development.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Django + Django REST Framework + Daphne |
| Database | Firebase Firestore |
| Auth | JWT (djangorestframework-simplejwt) |
| Real-time | Django Channels + Redis |
| Email | SendGrid (production), SMTP (development) |
| Deployment | Railway |
| State Management | Redux Toolkit |
| HTTP Client | Axios |

---

## 👥 Roles

- **SuperAdmin** — Hardcoded, mobile-only panel at `/system/init`
- **Admin** — Manages farmers, extension workers, tickets
- **Farmer** — Submits tickets
- **Extension Worker** — Handles tickets, needs admin approval

---

## ✨ Key Features

- 4-step registration flow (Account Setup → OTP → Personal Info → Success)
- OTP via SendGrid email (production) / terminal (development)
- Configurable theme by SuperAdmin (colors, border radius, Minecraft mode 🎮)
- Real-time theme/system updates via WebSocket
- Maintenance mode & endpoint control by SuperAdmin
- Session Expired ⏰ and Unauthorized 🔒 dialogs
- Remember Me — JWT lifetime 1 day or 7 days
- Switchable layout (Topbar / Sidebar)
- Profile panel with change password (OTP flow) and logout

---

## 🚀 Production

| Service | URL |
|---|---|
| Frontend | https://agricare.up.railway.app |
| Backend | https://agricareserver.up.railway.app |

---

## 💻 Local Development

### Requirements
- Python 3.11
- Node.js 20
- Docker Desktop (for Redis)

### Backend Setup
```bash
cd server
py -3.11 -m venv venv
venv\Scripts\activate
python -c "import codecs; f=codecs.open('requirements.txt','r',encoding='utf-16'); content=f.read(); f.close(); open('req_utf8.txt','w',encoding='utf-8').write(content)"
pip install -r req_utf8.txt
pip install cffi==1.17.1
pip install grpcio --upgrade
python -m daphne -p 8000 core.asgi:application
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Redis
```bash
docker start redis
```

---

## 📁 Project Structure

```
TicketingSystem/
├── client/         # React + Vite + Tailwind (Frontend)
└── server/         # Django + DRF (Backend)
```

---

> Built with ❤️ for Filipino farmers.
