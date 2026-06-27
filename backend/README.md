# OgaFix Backend API

This is the Node.js/Express backend API for the OgaFix platform.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Update the following in `.env`:
- `DB_HOST`: Your RDS endpoint
- `DB_PASSWORD`: Your database password
- `JWT_SECRET`: A secure random string
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `S3_BUCKET`: Your S3 bucket name
- `CLOUDFRONT_URL`: Your CloudFront distribution URL

### 3. Initialize Database

```bash
psql -h your-rds-endpoint -U ogafixadmin -d ogafix -f db/init.sql
```

Or use the migration script:

```bash
npm run migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get public user profile

### Tradesmen
- `GET /api/tradesmen/:id` - Get tradesman profile
- `PUT /api/tradesmen/:id` - Update tradesman profile
- `PUT /api/tradesmen/:id/service-areas` - Update service areas
- `GET /api/tradesmen/:id/matching-jobs` - Get matching jobs

### Jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id/status` - Update job status
- `POST /api/jobs/:id/responses` - Submit job response
- `GET /api/jobs/:id/responses` - Get job responses

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/:user_id` - Get conversation
- `GET /api/messages/inbox` - Get inbox
- `PUT /api/messages/:id/read` - Mark as read

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/user/:user_id` - Get user reviews
- `GET /api/reviews/job/:job_id` - Get job review

### Cities
- `GET /api/cities` - Get all cities
- `GET /api/cities/:id` - Get city details
- `GET /api/cities/states/list` - Get all states

## Deployment to AWS Lightsail

### 1. Build Docker Image

```bash
docker build -t ogafix-api:latest .
```

### 2. Push to Lightsail

SSH into your Lightsail instance and:

```bash
# Clone the repository
git clone https://github.com/Chi-eze/ogafix-website.git
cd ogafix-website/backend

# Build Docker image
docker build -t ogafix-api:latest .

# Run container
docker run -d \
  --name ogafix-api \
  -p 3000:3000 \
  --env-file .env \
  ogafix-api:latest
```

### 3. Set Up Reverse Proxy (Nginx)

```bash
sudo apt-get install nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/ogafix

# Add the following:
server {
  listen 80;
  server_name api.ogafix.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/ogafix /etc/nginx/sites-enabled/

# Test and restart nginx
sudo nginx -t
sudo systemctl restart nginx
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| DB_HOST | RDS endpoint | ogafix-db.xxxxx.eu-west-1.rds.amazonaws.com |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | ogafix |
| DB_USER | Database user | ogafixadmin |
| DB_PASSWORD | Database password | YourSecurePassword123! |
| PORT | Server port | 3000 |
| NODE_ENV | Environment | production |
| JWT_SECRET | JWT signing key | your-secret-key |
| JWT_EXPIRY | Token expiry | 7d |
| AWS_REGION | AWS region | eu-west-1 |
| S3_BUCKET | S3 bucket name | ogafix-images-prod-eu-west-1 |
| CLOUDFRONT_URL | CloudFront URL | https://d123456.cloudfront.net |
| FRONTEND_URL | Frontend URL | https://ogafix.com |

## Troubleshooting

### Database Connection Error

Ensure your RDS security group allows connections from Lightsail instance.

### JWT Token Error

Make sure `JWT_SECRET` is set and consistent across deployments.

### S3 Upload Error

Verify AWS credentials and S3 bucket permissions.
