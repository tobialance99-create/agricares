FOLLOW STRICTLY AND EVERY TIME:

Read and Understand Each File of the AgriCare TicketingSystem project.
Read the file everytime related to the prompt.
Confirm it to me and give me suggestions before proceeding and wait until i say go before giving me the code block.
If Multiple files, don't give me all the code.
Do it in a sequence form like "lets start this file first then continue to next file if done."
Before proceeding make sure to clarify to me first what i said. so i would know if you understand it. And after applying the code and i said "done".
Check the files again to confirm that there are no errors.
Dont decide for yourself if i miss your question. question it to me again.
If you are giving me a code block, show me the before and after.
Be consistent in Coding Pattern.

Project Name: AgriCare

Project Stack:
- Frontend: React + Vite + Tailwind CSS
- Backend: Django + Django REST Framework + Daphne (ASGI)
- Database: Firebase Firestore
- Auth: JWT (djangorestframework-simplejwt) + Supabase Auth (toggleable, SuperAdmin controlled)
- Real-time: Django Channels + Redis (InMemoryChannelLayer as fallback)
- Email: Gmail SMTP (production), terminal print (development)
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
- OTP: Supabase Auth (primary, sends via Gmail SMTP configured in Supabase) or custom Gmail SMTP (fallback) — toggled by SuperAdmin
- Theme: Configurable by SuperAdmin (colors, border radius, Minecraft mode)
- Minecraft Mode: Toggle logo, hero, music, font, Steve via SuperAdmin
- WebSocket: Real-time theme/system updates via Django Channels
- Maintenance Mode: SuperAdmin can disable the entire system
- Endpoint Control: SuperAdmin can disable individual API endpoints
- Profile Panel: Slide-out panel from right (avatar click) with layout toggle, change password, logout
- Session Expired: ⏰ shows when token cookie exists but 401, 🔒 Unauthorized shows when no token + protected route
- Layout: Switchable between Topbar and Sidebar (saved in permanent cookie)
- User Restore on Refresh: /auth/me/ endpoint restores user from token cookie on page load
- RouteGuard: Checks token on every route change including browser back/forward
- Remember Me: JWT token lifetime is 1 day (unchecked) or 7 days (checked) — controlled via AccessToken payload
- PageLoader: Hides scrollbar while active
- Minecraft Assets: Preloaded in index.html for faster rendering
- Profile Picture: Base64 uploaded via POST /users/profile-picture/, compressed to 200x200 JPEG 70% quality via canvas, stored in Firestore. Shown in Sidebar, Header, FarmersAccounts and ExtensionWorkers View Dialogs — initials fallback if none
- Admin Login: Dedicated page at /admin-login, /backdoor redirects to it. /login?role=admin redirects to /admin-login. Role blocking enforced per login page
- Sidebar click-to-lock-open — clicking anywhere on the sidebar when collapsed locks it open (saves to cookie); logo click navigates to dashboard when already open
- Page transitions — fade animation on route change (translateX removed to fix fixed-position stacking context issue)
- Dialog transitions — fade backdrop + slide up + scale on open/close, frozen children during close to prevent content flash
- SidePanel transitions — slide in/out from right with fade overlay, rendered with visibility state (not just CSS transform) to prevent off-screen DOM presence
- SidePanel only renders in DOM when open (if !isOpen return null pattern replaced with visible+animate state for transition support)
- Notifications page redesigned — split layout: left timeline list grouped by date (newest first), right detail panel with stats cards (Total, Unread, per-type counts) always visible at top + selected notification detail below
- FarmersAccounts — pagination added: page size selector (10/50/100), always visible, shows X–Y of Z, prev/next + page number buttons
- ExtensionWorkers — pagination added: same pattern as FarmersAccounts
- ExtensionWorkers clean rewrite — viewWorker state replaces selectedWorker+viewDialog boolean, statusStyle/statusLabel helpers extracted, Manage Positions uses SidePanel (not Dialog)
- Nav layout: Settings icon in Topbar Header (replaces profile avatar), Settings nav item in Sidebar below Notifications
- Sidebar profile section removed — profile accessible via Settings icon only
- Dashboard redesigned for all roles — hero banner with profile picture + gradient, improved stat cards with color accent bar, cleaner chart. Admin has Manage Farmers button, Extension Worker has View Tickets button, Farmer has Submit Ticket button
- positionName included in login/me responses and stored in Redux — shown instantly in Extension Worker hero banner without extra API call
- Dashboard templates system — SuperAdmin Templates page at /system/panel/templates, role tabs (Admin/Farmer/Extension Worker), per-page template cards with skeleton previews. Saved to Firestore system/config as dashboardTemplates map keyed role__page. Dispatched to Redux theme on load and WS updates
- Admin login always uses custom JWT regardless of useSupabaseAuth toggle — admins are not Supabase users
- Session expired fix — /system/config/ fetched first, then correct /auth/me/ or /auth/supabase/me/ called based on useSupabaseAuth. Failed me call with token dispatches setSessionExpired
- SupabaseAuthentication class added to backend — validates Supabase JWTs via supabase.auth.get_user(), registered in DEFAULT_AUTHENTICATION_CLASSES alongside FirebaseJWTAuthentication
- FirebaseUser now includes position_id from Firestore user data
- Dashboard nav link added to Farmer and Extension Worker layouts
- Notifications: Per-user subcollection at users/{userId}/notifications/{notificationId} with fields: type, message, relatedUserId, isRead, date
- Notification Types (admin): new_farmer, new_extension_worker — triggered on CompleteRegistrationView
- Notification Types (ticket): ticket_reply, ticket_pinned, ticket_resolved — triggered in tickets/views.py
- Notification Badge: Real-time via WebSocket ws/notifications/{userId}/ — AdminLayout fetches initial unread count + listens for new ones
- Notification Page: /notifications — lists all, click unread to mark as read, real-time via WebSocket
- ws/ticket-updates/ — new WebSocket channel for ticket list updates. TicketUpdatesConsumer → group: ticket_updates → handler: ticket_update. broadcast_ticket_update() in accounts/firebase_service.py. Called on: ticket submit, ticket join, ticket delete. Farmer KnowledgeRepository, Extension Worker Tickets, Admin KnowledgeRepository all listen to ws/ticket-updates/ (not ws/admin-updates/)
- Supabase Auth: SuperAdmin can toggle auth provider in System Control. Supabase = primary (email+password, OTP via email). Custom JWT + Gmail OTP = fallback. Toggle saved in Firestore system/config as useSupabaseAuth. Broadcast via WebSocket on change
- Supabase Auth routes: POST /auth/supabase/register/, POST /auth/supabase/verify-otp/, POST /auth/supabase/login/, POST /auth/supabase/forgot-password/, POST /auth/supabase/reset-password/, GET /auth/supabase/me/
- Supabase uses anon key client (supabase_anon) for verify_otp and sign_in_with_password, service key client (supabase) for sign_up
- OTP type for Supabase signup verification: 'signup' (not 'email')
- Supabase OTP is 8 digits — frontend maxLength set to 8
- Supabase email templates configured with Gmail SMTP in Supabase dashboard. Confirm signup template uses {{ .Token }} for OTP code
- Login with Supabase: email + password only (no mobile number). Mobile number still stored in Firestore as profile data
- useSupabaseAuth dispatched to Redux theme state from App.jsx on load and WebSocket config updates
- Position Management: Admin can add, edit, toggle, delete positions via SidePanel in ExtensionWorkers page
- positionId saved in Firestore on create_user()
- Change Position Dialog: shows current position as disabled default, filters it from dropdown, Save disabled if unchanged
- Ticket System: farmers submit tickets to extension workers with concern text
- Ticket Keyword Extraction: backend strips stopwords, extracts meaningful keywords from concern text (extract_keywords() in tickets/firebase_service.py)
- Ticket Matching: find_matching_ticket() checks existing pending/ongoing tickets for same worker with overlapping keywords — fuzzy match
- Ticket Flow: farmer fills form (name readonly, barangay readonly, concern) → POST /tickets/check/ → if match found show join dialog, if not show confirm dialog → POST /tickets/submit/ with joinExisting flag
- Ticket Structure: tickets/{ticketId} with extensionWorkerId, extensionWorkerName, concern, keywords[], status, participants[], date
- Ticket Messages: tickets/{ticketId}/messages/{messageId} with senderId, senderName, senderRole, message, fileData, fileName, fileType, isPinned, date
- Ticket Statuses: pending (waiting for worker) → ongoing (worker responded) → resolved
- Ticket Visibility: all farmers see all tickets (public knowledge base), extension workers see only their own, admin sees all
- Multiple farmers can join same ticket as participants — their concern message auto-added to thread
- Farmer Extension Workers page: card grid (1/2/3 cols), only active+approved workers, Submit Ticket opens ticket flow
- Farmer/Extension Worker Dashboard: stat cards (Total, Pending, Resolved Tickets) + bar chart wired to real data. Farmer uses GET /dashboard/farmer-stats/, Extension Worker uses GET /dashboard/worker-stats/
- Admin Dashboard: stat cards (Active Workers, Inactive Workers, Repo Visits, Tickets Today) + bar chart wired to GET /dashboard/stats/
- Reports & Analytics: admin page at /admin/reports — 2x2 grid of charts. Monthly Tickets (bar, click → matrix table: Month vs Position, year filter dropdown, export CSV). Monthly New Farmers (bar, click → table with year filter + export CSV). Extension Worker Status (4 inner cards: Total/Online/Offline/Deleted, click → weekly/monthly table with mode toggle, year filter, week nav ‹ ›, export CSV). Monthly Repository Visits (bar, click → weekly/monthly table with mode toggle, year filter, week nav ‹ ›, export CSV). All year dropdowns are dynamic (only years with actual data). Tables default to current year / current week.
- MeView now includes barangay field
- barangay included in LoginView response so Redux user has it immediately on login
- Email duplicate check commented out for testing (RegisterView, Register.jsx debounce, handleStep1 validation)
- Knowledge Repository: farmer page at /farmer/knowledge-repository — lists all tickets, search by concern/worker name, filter by status tabs (all/pending/ongoing/resolved), visit counter via POST /tickets/visits/ on mount
- Knowledge Repository visit counter: GET /tickets/visits/ returns count, POST increments — stored in analytics/knowledge_repository Firestore doc
- Ticket detail dialog (farmer): shows extension worker name, status, concern block, pinned answer block, full message thread, reply input (participants only), close button
- Ticket detail dialog (extension worker): shows date, status, concern block, pinned answer block, full message thread, reply input, pin buttons per message, Mark as Ongoing / Mark as Resolved buttons
- Pinned Message: extension worker clicks pin icon on any message → that message becomes pinned, all others unpinned. pinnedMessageId stored on ticket doc. Pinned block shown above thread below concern. Clicking pinned block scrolls to that message in thread
- Pinned block shows file icon + filename for images (click opens lightbox) and non-images (click downloads) — no inline image in pinned block
- Auto Ongoing: when extension worker sends first reply on a pending ticket, status auto-updates to ongoing
- File/Image Attachments: base64 stored in Firestore on messages. Fields: fileData, fileName, fileType. 750KB max enforced on frontend (accounts for base64 ~33% inflation to stay under Firestore 1MB field limit). Backend also validates with 400 error if exceeded. File upload also available in Submit Ticket form (stored in initial message). Inline error message shown (not alert) when file too large, clears on typing or dialog reopen
- Images render inline in message bubbles (max-w-[200px]), click → fullscreen lightbox overlay (z-[60], black bg, close button)
- Non-image files render as downloadable anchor with MdInsertDriveFile icon and filename
- Attachment preview strip shown above reply input before sending (thumbnail for images, file icon for others, ✕ to remove)
- Real-time messages: TicketConsumer (ws/tickets/<ticket_id>/) broadcasts new_message and pin_updated events. Both farmer and extension worker open WS when dialog opens, close on dialog close. Uses refetchRef + selectedIdRef pattern to avoid stale closure issues with large base64 payloads
- Admin Knowledge Repository: admin page at /admin/knowledge-repository — ticket list server-side filtered by week (‹ › nav), month dropdown (Jan–Dec), year dropdown (dynamic, only years with data). All 3 filters linked — week nav auto-updates month + year, month/year change jumps to Monday of that month's first week. Search + status tabs filter client-side on top. Detail dialog with full message thread (read-only), Mark as Ongoing/Resolved, Delete individual messages per bubble. Delete Ticket button on each ticket card (not in dialog) opens confirm Dialog. Real-time via TicketConsumer WS
- Ticket Notifications: submit ticket → notifies extension worker; join ticket → notifies extension worker; extension worker reply → notifies all participants with message preview ('{name} replied: {message}'); farmer reply → notifies extension worker with message preview; file-only reply → '{name} replied and sent an attachment.'; pin → notifies all participants; mark as ongoing → notifies all participants; resolved → notifies all participants. All use create_notification() + notify_user_ws()
- Notification relatedTicketId field — stored in Firestore on all ticket notifications. create_notification() accepts related_ticket_id param
- Notifications page — View Ticket button shown for ticket notifications (ticket_reply, ticket_pinned, ticket_resolved) when relatedTicketId present. Navigates to /farmer/knowledge-repository or /extension-worker/tickets with { state: { ticketId } }. Target page auto-opens ticket dialog and scrolls to card on mount
- Notification detail panel shows MdInsertDriveFile icon when message contains 'sent an attachment'
- Notifications page uses correct layout per role: FarmerLayout / ExtensionWorkerLayout / AdminLayout
- FarmerLayout and ExtensionWorkerLayout: added unread count fetch on mount + ws/notifications/{userId}/ WebSocket for real-time badge increment. Notifications nav link NOT in navLinks array (Sidebar/Topbar add it automatically via allLinks)
- FarmersAccounts: table with search, Export CSV button (exports filtered list as CSV). Columns: Name, Username, Barangay, Mobile, Status, Registered
- ExtensionWorkers: table with search, Export CSV button (exports filtered list as CSV). Columns: Name, Username, Mobile, Position, Status, Registered
- Send Notification: admin-only feature on /notifications page — Send Notification button opens dialog with: user search input (live dropdown, selected as chips, supports multiple), Send to All checkbox (all roles: farmers + workers + admins), free-type Type field, Message textarea. POST /users/notifications/send/ with { userIds, type, message }. GET /users/all/ returns all users for dropdown
- Mobile Responsive Admin: all admin pages work at 392px viewport. Sidebar layout — sidebar hidden on mobile, fixed bottom nav bar (icons + short labels, notification badge) shown instead, mobile header (logo + avatar) at top. Topbar layout — nav links hidden on mobile, same fixed bottom nav bar shown. Short labels: Knowledge Repository → Repo, Extension Workers → Workers, Notifications → Notifs. Main content has pb-24 on mobile to avoid bottom nav overlap. Footer hidden on mobile. All dialogs slide up from bottom on mobile (full width, rounded-t-2xl, max-h-[90vh] overflow-y-auto), centered on desktop (w-fit, rounded-xl). All tables: overflow-x-auto + min-w + whitespace-nowrap on all td cells so long data scrolls horizontally
- Knowledge Repository top-level tabs — All Tickets (default) / My Tickets (participant) / My Resolved (participant + resolved). Switching top tab resets status tab to all
- Mobile layout toggle hidden — Layout toggle (Topbar/Sidebar) in ProfilePanel wrapped with `hidden md:block`, useless on mobile
- Notification dialog on mobile — tapping a notification opens a Dialog on mobile (window.innerWidth < 768). `notifDetail()` helper reused by both mobile Dialog and desktop right panel
- Dialog z-index order — Bottom nav `z-[60]` → SidePanel `z-[65]` → Dialog `z-[70]` → Confirmation `z-[75]` → Lightbox `z-[80]`
- Dialog `mobileMaxH` prop — cleanly overrides mobile max-height without Tailwind class conflicts. Default `max-h-[70vh]`. Panel has `mb-16 sm:mb-0` to float above bottom nav on mobile
- Keyword matching fix — `find_matching_ticket` re-extracts keywords from concern field when stored keywords is empty (fixes old tickets created before length filter fix)

WebSocket Consumers (server/core/consumers.py):
- SystemConsumer → group: system → handler: system_update
- NotificationConsumer → group: notifications_{userId} → handler: send_notification
- AdminUpdatesConsumer → group: admin_updates → handler: admin_update
- TicketUpdatesConsumer → group: ticket_updates → handler: ticket_update
- TicketConsumer → group: ticket_{ticketId} → handler: ticket_message

WebSocket Routes (server/core/routing.py):
- ws/system/
- ws/notifications/<user_id>/
- ws/admin-updates/
- ws/ticket-updates/
- ws/tickets/<ticket_id>/

Firestore Collections:
- users — all user accounts (farmers, extension workers, admins)
- users/{userId}/notifications — per-user notifications subcollection
- positions — extension worker positions
- tickets — all tickets with messages subcollection (tickets/{ticketId}/messages/)
- pending_registrations — temporary registration data (Redis preferred)
- otps — OTP storage (Redis preferred)
- worker_logs — per-event log for extension worker status changes. Each doc: workerId, type (online/offline/deleted), date. Written by log_worker_event() called from toggle_user_active() and delete_user()
- analytics — visit counters (analytics/knowledge_repository → visits + monthly_visits map keyed 'Mon YYYY' + daily_visits map keyed 'YYYY-MM-DD'), deleted worker count (analytics/extension_workers → deleted)

Local Development:
- Frontend: npm run dev (port 5173)
- Backend: python -m daphne -p 8000 core.asgi:application (requires venv with Python 3.11)
- Redis (first time): docker run -d --name redis -p 6379:6379 redis
- Redis (after first time): docker start redis
- venv setup: py -3.11 -m venv venv → venv\Scripts\activate → pip install -r req_utf8.txt
- cffi must be downgraded: pip install cffi==1.17.1
- grpcio must be pinned: pip install grpcio==1.80.0

Key Insights:
- Auth endpoints (/auth/login/, /auth/forgot-password/, /system/login/) are excluded from session expired/unauthorized interceptor
- get_tokens uses AccessToken directly with custom exp payload for Remember Me duration
- requirements.txt is UTF-16 encoded (PowerShell saves as UTF-16) — Dockerfile converts it, locally use req_utf8.txt
- grpcio must be pinned: pip install grpcio==1.80.0
- Gmail SMTP is used for email OTP in production (DEBUG=False), terminal print in development (DEBUG=True)
- Gmail requires App Password (not regular password) — generate at myaccount.google.com/apppasswords (requires 2FA). App password must include spaces as displayed (e.g. 'idsj aiva dgwx thdz')
- .env must be created in server/ with: SECRET_KEY, DEBUG, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD, RESEND_API_KEY, GMAIL_USER, GMAIL_APP_PASSWORD, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, CORS_ALLOWED_ORIGINS
- client/.env must be created with: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- Firebase Storage requires Blaze plan — base64 in Firestore used instead (images compressed to 200x200 JPEG 70%)
- /admin path conflict fixed by using /admin/ with trailing slash in protectedPaths so /admin-login isn't blocked
- notify_admins_ws() loops through all admins internally — must be called OUTSIDE the per-admin loop to avoid duplicate badge increments
- broadcast_admin_update() sends to group admin_updates — all admin pages listening will refetch
- Notifications page uses ws/notifications/{userId}/ to refetch on new notification in real-time
- Firestore composite index required for .where() + .order_by() on different fields — workaround: remove order_by, sort in Python instead
- get_tickets_by_worker() uses Python sort instead of Firestore order_by to avoid composite index requirement
- find_matching_ticket() filters status in Python instead of using .where('status', 'in', [...]) to avoid composite index
- TicketMessageView fetches sender name via get_user_by_id() from Firestore — request.user does not have first_name/last_name attributes
- Real-time WS stale closure fix: use refetchRef (updated every render) + selectedIdRef so ws.onmessage always calls latest refetch function — critical for large base64 file payloads
- File attachments stored as base64 in Firestore message docs — same pattern as profile pictures, no Firebase Storage needed
- Ticket reply input: send enabled if text OR file present (not both required)
- Farmer reply input only shown if user.id is in ticket.participants — non-participant farmers can only read
- notify_user_ws(user_id, notification) in accounts/firebase_service.py — sends WS push to a single user's notification group (same pattern as notify_admins_ws but for one user)
- Dashboard base endpoints: GET /dashboard/stats/ (admin), GET /dashboard/farmer-stats/ (farmer), GET /dashboard/worker-stats/ (extension worker)
- Reports & Analytics dashboard endpoints: GET /dashboard/reports/ (main stats + availableYears + availableFarmerYears + availableWorkerYears + availableVisitYears), GET /dashboard/reports/tickets-by-position/?year=YYYY, GET /dashboard/reports/farmers-by-month/?year=YYYY, GET /dashboard/reports/worker-logs/?mode=weekly|monthly&year=YYYY&week_offset=N, GET /dashboard/reports/visits-log/?mode=weekly|monthly&year=YYYY&week_offset=N
- get_monthly_tickets_by_position() — builds Month × Position matrix by cross-referencing tickets with worker positionIds
- worker_logs Firestore collection: written by log_worker_event() on every toggle_user_active() (online/offline) and delete_user() (deleted) for extension workers
- increment_knowledge_repository_visits() updates both monthly_visits (keyed 'Mon YYYY') and daily_visits (keyed 'YYYY-MM-DD') in analytics/knowledge_repository
- delete_user() increments analytics/extension_workers → deleted AND writes a worker_logs entry with type=deleted
- GET /users/all/ — admin only, returns all users (farmers + extension workers + admins) with id, firstName, lastName, role. Used for Send Notification user search dropdown
- POST /users/notifications/send/ — admin only, accepts { userIds, type, message }, calls create_notification() + notify_user_ws() for each user
- GET /tickets/?week_start=YYYY-MM-DD — admin/farmer ticket list, filtered by 7-day window from given Monday. Returns { tickets, weekLabel, month, year, availableYears }. Extension worker path unchanged (returns plain array)
- get_all_tickets_filtered(week_start_date) in tickets/firebase_service.py — filters tickets by week window, returns tickets + week label + month + year
- get_available_ticket_years() in tickets/firebase_service.py — returns sorted list of years with ticket data
- Admin KnowledgeRepository filter state: weekStart (Date), filterMonth (0–11), filterYear, weekLabel, availableYears. getMondayOfWeek(year, month, day) computes Monday of the week containing that date. Changing month/year jumps to Monday of the 1st of that month
- Django URL ordering: sub-paths (reports/tickets-by-position/, reports/worker-logs/, etc.) must be registered BEFORE reports/ to avoid 404 — Django matches top-to-bottom
- Reports dialog types: tickets (year filter), farmers (year filter), workers (mode toggle + year + week nav), visits (mode toggle + year + week nav). Export CSV filename includes year or week label depending on type/mode
- Dialog.jsx mobile pattern: items-end on mobile (slides up from bottom), items-center on sm+. Full width + rounded-t-2xl on mobile, w-fit + rounded-xl on sm+. max-h-[70vh] default (mobileMaxH prop), mb-16 sm:mb-0 to float above bottom nav
- Z-index order: Bottom nav z-[60] → SidePanel z-[65] → Dialog z-[70] → Confirmation z-[75] → Lightbox z-[80]
- Bottom nav short labels: Knowledge Repository → Repo, Extension Workers → Workers, Notifications → Notifs
- Table mobile pattern: overflow-x-auto wrapper + min-w-[Npx] on table + whitespace-nowrap on all td cells

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
- supabase (latest) — added to req_utf8.txt
- @supabase/supabase-js (latest) — added to client/package.json
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
