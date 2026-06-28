# OgaFix Backend API

Node.js/Express API with PostgreSQL and Socket.io real-time messaging.

## Setup

```bash
npm install
cp .env.example .env
```

### Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | RDS endpoint | `ogafix-db.xxxxx.eu-west-1.rds.amazonaws.com` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `ogafix` |
| `DB_USER` | Database user | `ogafixadmin` |
| `DB_PASSWORD` | Database password | (secret) |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` / `production` |
| `JWT_SECRET` | JWT signing key | (secret) |
| `JWT_EXPIRY` | Token expiry | `7d` |
| `FRONTEND_URL` | CORS + Socket.io origin | `https://ogafix.work` |
| `USE_PARAMETER_STORE` | Load DB creds from AWS SSM | `true` (production) |
| `AWS_REGION` | AWS region | `eu-west-1` |

## Database

**Initialize schema (new database):**

```bash
npm run db:init
```

**Apply migrations (existing database):**

```bash
npm run migrate
```

Or manually:

```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f db/init.sql
```

### Dual-role model

- `users` — one row per person (customer capabilities by default)
- `tradesmen` — optional extension; created at tradesman signup or via `POST /api/users/become-tradesman`
- `jobs.customer_id` references `users.id` (not `tradesmen.id`)
- `job_responses.tradesman_id` references `tradesmen.id`

JWT payload includes `id`, `email`, `is_tradesman`, `tradesman_id`. Full profile from `GET /api/users/profile` via `lib/auth.js`.

## Development

```bash
npm run dev
```

- REST: `http://localhost:3000/api`
- Health: `http://localhost:3000/health`
- Socket.io: `http://localhost:3000/socket.io`

## API endpoints

### Auth
- `POST /api/auth/register` — body: `email`, `password`, `first_name`, `last_name`, optional `user_type` (`customer`|`tradesman`), optional `phone_number`
- `POST /api/auth/login`
- `POST /api/auth/verify` — header: `Authorization: Bearer <token>`

### Users
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `POST /api/users/become-tradesman` — body: optional `trade_category`
- `GET /api/users/:id`

### Tradesmen
- `GET /api/tradesmen/me`
- `GET /api/tradesmen/me/matching-jobs`
- `GET /api/tradesmen/:id`
- `PUT /api/tradesmen/:id` (owner only)
- `PUT /api/tradesmen/:id/service-areas`
- `GET /api/tradesmen/:id/matching-jobs`

### Jobs
- `POST /api/jobs` — any authenticated user
- `GET /api/jobs` — query: `city_id`, `category`, `status`
- `GET /api/jobs/mine` — current user's posted jobs
- `GET /api/jobs/:id`
- `PUT /api/jobs/:id/status`
- `POST /api/jobs/:id/responses` — tradesman only
- `GET /api/jobs/:id/responses`

### Messages (REST + Socket.io)
- `POST /api/messages` — body: `recipient_id`, `content`, optional `job_id`
- `GET /api/messages/inbox`
- `GET /api/messages/conversation/:user_id`
- `PUT /api/messages/:id/read`

**Socket.io:** Client connects with `{ auth: { token: '<jwt>' } }`. Server emits `new_message` to recipient and conversation room.

### Reviews
- `POST /api/reviews`
- `GET /api/reviews/user/:user_id`
- `GET /api/reviews/job/:job_id`

### Cities
- `GET /api/cities`
- `GET /api/cities/:id`
- `GET /api/cities/states/list`

## Production (EC2 + systemd)

The API runs as `ogafix-backend.service` on port 3000. nginx proxies `/api/` and `/socket.io/`.

```bash
sudo systemctl restart ogafix-backend
sudo systemctl status ogafix-backend
tail -f /var/log/ogafix-backend.log
```

After code deploy:

```bash
cd /home/ubuntu/ogafix-website/backend
npm install
sudo systemctl restart ogafix-backend
```

### nginx (required for Socket.io over HTTPS)

```nginx
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /socket.io/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

See `ogafix-infrastructure/nginx/ogafix.letsencrypt.conf` for the full production config.

## Docker (optional)

```bash
docker build -t ogafix-api:latest .
docker run -d --name ogafix-api -p 3000:3000 --env-file .env ogafix-api:latest
```

## Troubleshooting

**Database connection failed** — Check RDS security group allows EC2 on port 5432.

**Migration failed** — Ensure `DB_*` env vars are set (or `USE_PARAMETER_STORE=true` on EC2).

**Socket.io not connecting** — Verify nginx `/socket.io/` proxy and `FRONTEND_URL` matches the site origin.

**JWT errors** — `JWT_SECRET` must be consistent across restarts.
