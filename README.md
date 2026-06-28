# OgaFix Website

Web application for the OgaFix platform — connecting customers with trusted tradesmen across Nigeria.

**Production:** https://ogafix.work

## Project structure

```
ogafix-website/
├── backend/                 # Node.js/Express API + Socket.io
│   ├── db/
│   │   ├── init.sql         # Full PostgreSQL schema
│   │   └── migrations/      # Incremental SQL migrations
│   ├── lib/
│   │   ├── auth.js          # JWT helpers + user payload (dual role)
│   │   ├── socket.js        # Real-time messaging (Socket.io)
│   │   └── secrets.js       # AWS Parameter Store (production)
│   ├── migrations/
│   │   ├── init-db.js       # Run init.sql against RDS
│   │   └── run.js           # Apply SQL migrations
│   ├── routes/              # REST API endpoints
│   └── server.js
├── frontend/                # React + Vite + Tailwind
│   ├── public/              # Static assets (hero images)
│   └── src/
│       ├── components/      # UI components
│       ├── data/trades.js   # 26 trade categories
│       ├── lib/socket.js    # Socket.io client
│       ├── pages/
│       ├── services/api.js
│       └── store/authStore.js
└── README.md
```

## Quick start (local)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Set DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET
npm run db:init    # first time only — creates all tables
npm run dev
```

API: `http://localhost:3000`  
Socket.io: `http://localhost:3000/socket.io`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173` (Vite default)

Set in `frontend/.env.local`:

```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Technology stack

| Layer | Stack |
|-------|--------|
| Backend | Node.js 18+, Express, PostgreSQL, JWT, Socket.io |
| Frontend | React 18, Vite, Tailwind CSS, Zustand, Axios |
| Images | AWS S3 + CloudFront (via `ogafix-infrastructure`) |
| Production | EC2 + nginx + Let's Encrypt + RDS |

## User model (dual role)

One login per person. **Everyone is a customer** (can post jobs). **Tradesman is an optional profile.**

| Table | Purpose |
|-------|---------|
| `users` | Account — email, password, name, phone |
| `tradesmen` | Optional — trade, ratings, portfolio, service areas |
| `jobs` | `customer_id` → any `users.id` |
| `job_responses` | `tradesman_id` → `tradesmen.id` only |
| `messages` | Between any two `users.id` (role-neutral) |

A tradesman can hire another tradesman for a different job on the same account.

**API highlights:**
- `POST /api/users/become-tradesman` — add tradesman profile to existing account
- `GET /api/jobs/mine` — jobs you posted
- `GET /api/tradesmen/me` — your tradesman profile
- `GET /api/tradesmen/me/matching-jobs` — open jobs in your trade/areas

## Real-time messaging

Messages are stored in PostgreSQL and delivered in real time via **Socket.io** (no extra service cost).

- REST: `POST /api/messages`, `GET /api/messages/inbox`, `GET /api/messages/conversation/:user_id`
- WebSocket: connect with JWT in `auth.token`; listen for `new_message`

## API reference

### Authentication
- `POST /api/auth/register` — Register (`user_type`: customer or tradesman at signup)
- `POST /api/auth/login` — Login
- `POST /api/auth/verify` — Verify JWT and refresh user payload

### Users
- `GET /api/users/profile` — Current user (includes `is_tradesman`, `tradesman_id`)
- `PUT /api/users/profile` — Update profile
- `POST /api/users/become-tradesman` — Create tradesman profile
- `GET /api/users/:id` — Public user info

### Tradesmen
- `GET /api/tradesmen/me` — Current user's tradesman profile
- `GET /api/tradesmen/me/matching-jobs` — Jobs matching your trade/areas
- `GET /api/tradesmen/:id` — Public tradesman profile
- `PUT /api/tradesmen/:id` — Update tradesman profile (owner only)
- `PUT /api/tradesmen/:id/service-areas` — Update service areas

### Jobs
- `POST /api/jobs` — Create job (any logged-in user)
- `GET /api/jobs` — List jobs (filters: `city_id`, `category`, `status`)
- `GET /api/jobs/mine` — Jobs posted by current user
- `GET /api/jobs/:id` — Job details
- `PUT /api/jobs/:id/status` — Update status
- `POST /api/jobs/:id/responses` — Submit quote (tradesman only)
- `GET /api/jobs/:id/responses` — List quotes

### Messages
- `POST /api/messages` — Send message
- `GET /api/messages/inbox` — Inbox with unread counts
- `GET /api/messages/conversation/:user_id` — Thread with a user
- `PUT /api/messages/:id/read` — Mark read

### Reviews & cities
- See `backend/README.md` for full list.

## Database setup

**New database:**

```bash
cd backend
npm run db:init
```

**Existing database (apply migrations only):**

```bash
npm run migrate
```

Schema lives in `backend/db/init.sql`. Migration `001_dual_role.sql` makes `tradesmen.trade_category` optional.

## Production deployment (EC2)

Current production layout:

```
Browser → nginx (HTTPS, Let's Encrypt) → / → frontend static (client/dist)
                                       → /api/ → Node :3000
                                       → /socket.io/ → Node :3000
```

### Deploy frontend

```bash
rsync -avz --exclude node_modules --exclude dist frontend/ ubuntu@<host>:/home/ubuntu/ogafix-website/frontend/
ssh ubuntu@<host> 'cd ogafix-website/frontend && npm run build && sudo cp -r dist/* /home/ubuntu/ogafix-website/client/dist/'
```

### Deploy backend

```bash
rsync -avz --exclude node_modules backend/ ubuntu@<host>:/home/ubuntu/ogafix-website/backend/
ssh ubuntu@<host> 'cd ogafix-website/backend && npm install && sudo systemctl restart ogafix-backend'
```

### nginx

Reference config: `ogafix-infrastructure/nginx/ogafix.letsencrypt.conf` (includes `/api/` and `/socket.io/` proxy).

HTTPS uses **Let's Encrypt** (Certbot) — free, auto-renews via `certbot.timer`. DNS stays on GoDaddy (A record → EC2 Elastic IP).

## Environment variables

### Backend (`.env` or systemd)

| Variable | Description |
|----------|-------------|
| `DB_HOST` | RDS endpoint |
| `DB_PORT` | `5432` |
| `DB_NAME` | `ogafix` |
| `DB_USER` / `DB_PASSWORD` | Database credentials |
| `JWT_SECRET` | Signing key |
| `FRONTEND_URL` | `https://ogafix.work` (CORS + Socket.io) |
| `NODE_ENV` | `production` |

### Frontend (`.env.production`)

```
VITE_API_URL=/api
```

Socket.io uses the same origin in production (proxied by nginx).

## Features

### Customers (all users)
- Post jobs with description, location, budget
- Browse open jobs and tradesmen
- Real-time messaging
- Reviews and ratings

### Tradesmen (optional profile)
- All customer features, plus:
- Tradesman profile, portfolio, service areas
- Browse matching jobs and submit quotes
- Build reputation through reviews

## Security

- bcrypt password hashing
- JWT authentication
- Parameterized SQL queries
- CORS restricted to `FRONTEND_URL`
- Socket.io connections require valid JWT

## License

MIT
