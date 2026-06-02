FOLLOW STRICTLY AND EVERY TIME:

Read and Understand Each File of the AgriCare TicketingSystem project.
Read the file everytime related to the prompt.
Confirm it to me and give me suggestions before proceeding and wait until i say go before giving me the code block.
If Multiple files, don't give me all the code.
Do it in a sequence form like "lets start this file first then continue to next file if done."
Before proceeding make sure to clarify to me first what i said. so i would know if you understand it. And after applying the code and i said done.
Check the files again to confirm that there are no errors.
Dont decide for yourself if i miss your question. question it to me again.
If you are giving me a code block, show me the before and after.
Be consistent in Coding Pattern.

Project Name: AgriCare

Project Stack:
- Frontend: React + Vite + Tailwind CSS
- Backend: Django + Django REST Framework + Daphne (ASGI)
- Database: Firebase Firestore
- Auth: JWT (djangorestframework-simplejwt)
- Real-time: Django Channels + Redis (InMemoryChannelLayer as fallback)
- Email: SendGrid (production), Django SMTP (development)
- Deployment: Railway (Frontend + Backend + Redis)
- State Management: Redux Toolkit + React Query
- HTTP Client: Axios

Project Structure:
- client/ → React + Vite + Tailwind (Frontend)
- server/ → Django + DRF (Backend)

Roles:
- SuperAdmin (hardcoded, mobile-only panel at /system/init)
- Admin (manages farmers, extension workers, tickets)
- Farmer (submits tickets)
- Extension Worker (handles tickets, needs admin approval)

Key Features:
- Registration: 4-step flow (Account Setup → OTP → Personal Info → Success)
- OTP: Sent via SendGrid email in production, printed in terminal in development
- Theme: Configurable by SuperAdmin (colors, border radius, Minecraft mode)
- Minecraft Mode: Toggle logo, hero, music, font, Steve via SuperAdmin
- WebSocket: Real-time theme/system updates via Django Channels
- Maintenance Mode: SuperAdmin can disable the entire system
- Endpoint Control: SuperAdmin can disable individual API endpoints

Local Development:
- Frontend: npm run dev (port 5173)
- Backend: python -m daphne -p 8000 core.asgi:application
- Redis: docker start redis

Production URLs:
- Frontend: https://agricare.up.railway.app
- Backend: https://agricareserver.up.railway.app

Backend Requirements (server/requirements.txt):
- Python: 3.11
- Django==5.2.2
- channels==3.0.5
- channels-redis==3.4.1
- daphne==3.0.2
- djangorestframework==3.17.1
- djangorestframework_simplejwt==5.5.1
- firebase_admin==7.4.0
- django-cors-headers==4.9.0
- redis==8.0.0
- sendgrid==6.12.5
- python-dotenv==1.2.2
- requests==2.34.2

Frontend Requirements (client/package.json):
- Node.js: 20
- react: ^19.2.6
- vite: ^8.0.12
- tailwindcss: ^4.3.0
- @reduxjs/toolkit: ^2.12.0
- react-redux: ^9.3.0
- @tanstack/react-query: ^5.100.14
- axios: ^1.16.1
- react-router-dom: ^7.16.0
- react-icons: ^5.6.0
- chart.js: ^4.5.1
- react-chartjs-2: ^5.3.1
